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
