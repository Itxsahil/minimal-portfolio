'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const VERTEX = `attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return { shader: null, error: 'could not create shader' };
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(sh) || 'unknown compile error';
    gl.deleteShader(sh);
    return { shader: null, error };
  }
  return { shader: sh, error: null };
}

export function ShaderCanvas({ source, title }: { source: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(true);

  // Paused unless the canvas is actually on screen. Four WebGL contexts all
  // drawing at once is a lot to ask of a laptop for the sake of a page nobody
  // is looking at the bottom of.
  const visible = useRef(false);

  // Read through a ref, not the dependency array: listing `running` as a
  // dependency would tear down the GL context and rebuild it on every pause,
  // which also resets the clock to zero.
  const runningRef = useRef(true);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const onToggle = useCallback(() => setRunning((r) => !r), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext('webgl', {
        antialias: false,
        alpha: false,
        preserveDrawingBuffer: true
      }) as
        | WebGLRenderingContext
        | null) ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      setError('This browser did not give us a WebGL context.');
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, source);
    if (!vs.shader || !fs.shader) {
      setError(fs.error ?? vs.error);
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs.shader);
    gl.attachShader(program, fs.shader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setError(gl.getProgramInfoLog(program) || 'link failed');
      return;
    }
    gl.useProgram(program);

    // one full-screen triangle pair
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');

    // Up to eight live ripples, oldest overwritten first. Shaders that do not
    // declare the uniform get a null location, and uploading to null is a
    // no-op, so this costs the other shaders nothing.
    const MAX_RIPPLES = 8;
    const uRipples = gl.getUniformLocation(program, 'u_ripples[0]');
    const ripples = new Float32Array(MAX_RIPPLES * 3);
    for (let i = 0; i < MAX_RIPPLES; i++) ripples[i * 3 + 2] = -999;
    let nextRipple = 0;
    let nextAuto = 1.2;

    // Cap the pixel ratio: a fragment shader costs per pixel, and a retina
    // screen would otherwise quadruple the bill for no visible gain here.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { rootMargin: '120px' }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const interactive = uRipples !== null;

    /** Drop a ripple at a point given in device pixels. */
    const spawnAt = (x: number, y: number, at: number) => {
      const i = nextRipple % MAX_RIPPLES;
      ripples[i * 3] = x;
      ripples[i * 3 + 1] = y;
      ripples[i * 3 + 2] = at;
      nextRipple++;
    };

    /** gl_FragCoord counts from the bottom-left, the pointer from the top. */
    const spawnFromPointer = (clientX: number, clientY: number, at: number) => {
      const rect = canvas.getBoundingClientRect();
      spawnAt(
        (clientX - rect.left) * dpr,
        (rect.height - (clientY - rect.top)) * dpr,
        at
      );
    };

    let lastDrag = 0;
    const onDown = (e: PointerEvent) =>
      spawnFromPointer(e.clientX, e.clientY, elapsed);
    const onMove = (e: PointerEvent) => {
      // A trail while dragging, rate limited so a fast swipe does not use up
      // every slot in a single frame.
      if (e.pressure === 0 && e.pointerType === 'mouse' && e.buttons === 0) {
        if (elapsed - lastDrag < 0.25) return;
      } else if (elapsed - lastDrag < 0.08) return;
      lastDrag = elapsed;
      spawnFromPointer(e.clientX, e.clientY, elapsed);
    };

    if (interactive) {
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.style.touchAction = 'pan-y';
      canvas.style.cursor = 'crosshair';
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = performance.now();
    let frame = 0;
    let elapsed = 0;
    let last = start;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);

      const active =
        visible.current && runningRef.current && !document.hidden && !reduced.matches;

      // Time only advances while we are drawing, so a paused shader resumes
      // where it stopped instead of jumping. The preserved buffer keeps the
      // last frame on screen while we skip the work.
      if (active) elapsed += (now - last) / 1000;
      last = now;
      if (!active && elapsed > 0) return;

      resize();

      if (interactive) {
        // A drop now and then, so the water is alive before anyone touches it.
        if (elapsed > nextAuto) {
          spawnAt(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            elapsed
          );
          nextAuto = elapsed + 2.2 + Math.random() * 2.0;
        }
        gl.uniform3fv(uRipples, ripples);
      }

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    frame = requestAnimationFrame(draw);

    const onLost = (e: Event) => {
      e.preventDefault();
      setError('The browser dropped this WebGL context.');
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [source]);

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 p-6 text-sm text-gray-500 dark:text-zinc-400 font-mono">
        {title} could not run here. {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-[260px] sm:h-[320px] rounded-lg block bg-gray-100 dark:bg-zinc-800"
        aria-label={`${title}, an animated fragment shader`}
        role="img"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute bottom-2 right-2 rounded-full bg-black/55 px-3 py-1 text-[0.7rem] font-mono text-white backdrop-blur-sm cursor-pointer"
      >
        {running ? 'pause' : 'play'}
      </button>
    </div>
  );
}
