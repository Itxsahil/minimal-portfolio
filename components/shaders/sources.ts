/** The strings in this file are both compiled and displayed. The page reads
 *  the same constant the renderer does, so the listing can never drift from
 *  what is on screen. */

export type Shader = {
  slug: string;
  title: string;
  note: string;
  source: string;
};

const plasma = `precision highp float;

uniform vec2  u_resolution;
uniform float u_time;

void main() {
  // centre the coordinates and keep them square
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution)
          / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.35;

  // three travelling waves, summed
  float v = sin(uv.x * 3.0 + t)
          + sin(uv.y * 4.0 - t * 1.3)
          + sin(length(uv) * 6.0 - t * 2.0);
  v /= 3.0;

  // cosine palette: one line, infinite gradients
  vec3 col = 0.5 + 0.5 * cos(6.2831 * (v + vec3(0.0, 0.33, 0.67)));

  gl_FragColor = vec4(col, 1.0);
}`;

const warp = `precision highp float;

uniform vec2  u_resolution;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// value noise: hash the lattice, smoothstep between corners
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// five octaves, each half the amplitude and twice the frequency
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.06;

  // domain warping: feed noise its own output, twice
  vec2 q = vec2(fbm(uv * 3.0 + t),
                fbm(uv * 3.0 + vec2(5.2, 1.3) - t));

  vec2 r = vec2(fbm(uv * 3.0 + 4.0 * q + vec2(1.7, 9.2)),
                fbm(uv * 3.0 + 4.0 * q + vec2(8.3, 2.8)));

  float f = fbm(uv * 3.0 + 4.0 * r);

  vec3 col = mix(vec3(0.04, 0.06, 0.12),
                 vec3(0.88, 0.74, 0.55),
                 clamp(f * f * 2.4, 0.0, 1.0));

  col = mix(col, vec3(0.22, 0.42, 0.62), clamp(length(q), 0.0, 1.0) * 0.4);

  gl_FragColor = vec4(col, 1.0);
}`;

const voronoi = `precision highp float;

uniform vec2  u_resolution;
uniform float u_time;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);
  uv *= 7.0;

  vec2 cell = floor(uv);
  vec2 f    = fract(uv);

  // nearest and second-nearest feature point
  float d1 = 8.0;
  float d2 = 8.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 p = hash2(cell + o);
      p = 0.5 + 0.45 * sin(u_time * 0.5 + 6.2831 * p);

      float d = length(o + p - f);
      if (d < d1) { d2 = d1; d1 = d; }
      else if (d < d2) { d2 = d; }
    }
  }

  // the gap between first and second is the cell border
  float edge = smoothstep(0.0, 0.07, d2 - d1);

  vec3 col = mix(vec3(0.09, 0.09, 0.10),
                 vec3(0.95, 0.94, 0.90), edge);

  gl_FragColor = vec4(col, 1.0);
}`;

const raymarch = `precision highp float;

uniform vec2  u_resolution;
uniform float u_time;

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdPlane(vec3 p)           { return p.y + 1.0;    }

// the scene as one distance function
float map(vec3 p) {
  vec3 q = p;
  q.y -= 0.25 + 0.25 * abs(sin(u_time * 1.2));

  float s = sdSphere(q, 0.6);
  s += 0.03 * sin(10.0 * p.x + u_time * 2.0)
             * sin(10.0 * p.z + u_time * 1.5);

  return min(s, sdPlane(p));
}

// gradient of the field is the surface normal
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy),
                        map(p + e.yxy) - map(p - e.yxy),
                        map(p + e.yyx) - map(p - e.yyx)));
}

// march toward the light; near misses darken the result
float shadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 0.05;
  for (int i = 0; i < 24; i++) {
    float h = map(ro + rd * t);
    res = min(res, 8.0 * h / t);
    t += clamp(h, 0.02, 0.2);
    if (h < 0.001 || t > 6.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution)
          / min(u_resolution.x, u_resolution.y);

  // camera orbits the origin
  vec3 ro = vec3(2.6 * sin(u_time * 0.25), 0.9, 2.6 * cos(u_time * 0.25));
  vec3 ta = vec3(0.0, 0.1, 0.0);

  vec3 w = normalize(ta - ro);
  vec3 u = normalize(cross(w, vec3(0.0, 1.0, 0.0)));
  vec3 v = cross(u, w);
  vec3 rd = normalize(uv.x * u + uv.y * v + 1.6 * w);

  // sphere tracing: step by the distance to the nearest surface
  float t = 0.0;
  for (int i = 0; i < 64; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001 || t > 20.0) break;
    t += d;
  }

  vec3 col = vec3(0.86, 0.85, 0.82) - 0.25 * rd.y;

  if (t < 20.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 l = normalize(vec3(0.7, 0.8, 0.4));

    float dif = clamp(dot(n, l), 0.0, 1.0) * shadow(p + n * 0.01, l);
    float amb = 0.4 + 0.6 * n.y;

    vec3 mat = p.y < -0.98 ? vec3(0.72, 0.72, 0.70)
                           : vec3(0.85, 0.45, 0.35);

    col = mat * (amb * vec3(0.35, 0.40, 0.50)
               + dif * vec3(1.10, 1.00, 0.85));
  }

  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545)); // gamma
  gl_FragColor = vec4(col, 1.0);
}`;

export const SHADERS: Shader[] = [
  {
    slug: 'plasma',
    title: 'Plasma',
    note: 'Three sine waves summed and pushed through a cosine palette. The whole image is nine lines of arithmetic; there is no texture and no geometry, only a function of position and time.',
    source: plasma
  },
  {
    slug: 'domain-warp',
    title: 'Domain warp',
    note: 'Fractal noise whose input coordinates are themselves displaced by fractal noise, twice over. Warping the domain rather than the output is what turns smooth clouds into something that looks eroded.',
    source: warp
  },
  {
    slug: 'voronoi',
    title: 'Voronoi cells',
    note: 'Each pixel finds its nearest and second-nearest scattered point. The difference between those two distances is near zero exactly on a cell border, which draws the lines without ever storing an edge.',
    source: voronoi
  },
  {
    slug: 'raymarch',
    title: 'Raymarched sphere',
    note: 'Signed distance fields and sphere tracing. The scene is one function returning how far the nearest surface is, and the renderer walks along each ray by exactly that much. Normals come from the gradient, shadows from a second march toward the light.',
    source: raymarch
  }
];
