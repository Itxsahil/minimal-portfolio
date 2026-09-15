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

const ripples = `precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec3  u_ripples[8];   // xy: where it was dropped, z: when

// the tiled floor of the pool, seen through the water
vec3 poolFloor(vec2 p) {
  vec2 cell = floor(p * 6.0);
  float checker = mod(cell.x + cell.y, 2.0);
  vec3 col = mix(vec3(0.10, 0.38, 0.45),
                 vec3(0.07, 0.28, 0.37), checker);

  vec2 g = abs(fract(p * 6.0) - 0.5);
  col *= 1.0 - 0.40 * smoothstep(0.43, 0.5, max(g.x, g.y)); // grout
  return col;
}

// height of the water, in square units
float surface(vec2 p) {
  // a slow swell, so the water is never completely still
  float h = 0.5 * sin(p.x *  9.0 + u_time * 0.9)
          + 0.4 * sin(p.y * 11.0 - u_time * 0.7)
          + 0.3 * sin((p.x + p.y) * 7.0 + u_time * 1.3);
  h *= 0.10;

  float scale = min(u_resolution.x, u_resolution.y);

  for (int i = 0; i < 8; i++) {
    vec3 r = u_ripples[i];
    float age = u_time - r.z;
    if (r.z < 0.0 || age < 0.0 || age > 5.0) continue;

    // one ring per drop, travelling outward and flattening as it goes
    float d = distance(p, r.xy / scale);
    float w = d - age * 0.42;

    float envelope = exp(-age * 0.75) * exp(-abs(w) * 10.0);
    h += 0.55 * sin(w * 48.0) * envelope;
  }

  return h;
}

void main() {
  float scale = min(u_resolution.x, u_resolution.y);
  vec2 p = gl_FragCoord.xy / scale;   // square units, so the tiles stay square

  // the gradient of the height field is the tilt of the surface
  float e  = 1.0 / scale;
  float h  = surface(p);
  float hx = surface(p + vec2(e, 0.0));
  float hy = surface(p + vec2(0.0, e));
  vec2 slope = vec2(hx - h, hy - h) / e;

  // a tilted surface bends the view of the floor: refraction, cheaply
  vec3 col = poolFloor(p + slope * 0.016);

  // light glancing off the tilt
  vec3 n = normalize(vec3(-slope * 0.09, 1.0));
  vec3 l = normalize(vec3(0.45, 0.60, 0.65));
  col += vec3(0.85, 0.95, 1.00) * pow(max(dot(n, l), 0.0), 22.0) * 1.3;

  // the wave fronts themselves catch the light
  col += vec3(0.35, 0.60, 0.66) * clamp(length(slope) * 0.055, 0.0, 1.0) * 0.8;

  gl_FragColor = vec4(col, 1.0);
}`;

const stars = `precision highp float;

uniform vec2  u_resolution;
uniform float u_time;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
  float n = hash21(p);
  return vec2(n, hash21(p + n));
}

// One lattice of stars. Every cell holds a candidate; only those above the
// cut light up, and the survivors take their place, brightness and behaviour
// from the same hash. Neighbouring cells are checked too, so a star sits
// anywhere in its cell and can spill across the edge. Confining them to the
// middle of a cell is cheaper, and at these densities you can see the grid.
float layer(vec2 uv, float density, float glow, float cut, float seed) {
  vec2 g = uv * density;
  vec2 cell = floor(g);
  vec2 f = fract(g) - 0.5;

  float acc = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 id = cell + o + seed;

      float mag = hash21(id + 3.7);
      if (mag < cut) continue;                 // most of the sky is empty

      vec2 at = hash22(id) - 0.5;
      float bright = (mag - cut) / (1.0 - cut);

      // Scintillation is the air, not the star. Most hold steady; a few
      // shimmer hard and a few more waver. Two detuned sines multiplied give
      // an irregular flicker rather than a clean pulse.
      float roll = hash21(id + 11.3);
      float amount = roll > 0.86 ? 0.55 : (roll > 0.62 ? 0.20 : 0.0);
      float s1 = sin(u_time * (1.7 + mag * 5.0) + mag * 43.0);
      float s2 = sin(u_time * (2.9 + roll * 4.0) + roll * 17.0);
      float flicker = 1.0 - amount * (0.5 - 0.5 * s1 * s2);

      float d = length(f - o - at);
      acc += bright * flicker * glow / (d * d + glow * 0.42);
    }
  }
  return acc;
}

// soft noise, for the band of stars too distant to resolve
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

// one meteor, every seventh second, from wherever it likes
float meteor(vec2 uv) {
  float period = 7.0;
  float k = floor(u_time / period);
  float age = fract(u_time / period) * period;

  vec2 from = (hash22(vec2(k, 3.1)) - vec2(0.5, 0.15)) * vec2(2.4, 1.3);
  vec2 dir = normalize(vec2(-0.85, -0.38));

  vec2 d = uv - (from + dir * age * 0.85);
  float along = dot(d, -dir);
  float across = length(d + dir * along);

  float streak = exp(-across * 300.0) * exp(-max(along, 0.0) * 11.0);
  float life = smoothstep(0.0, 0.12, age) * smoothstep(1.7, 0.7, age);
  return streak * life * step(0.0, along);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution)
          / min(u_resolution.x, u_resolution.y);

  float h = gl_FragCoord.y / u_resolution.y;

  // night: deep blue overhead, a little warmth left near the ground
  vec3 sky = mix(vec3(0.020, 0.026, 0.055), vec3(0.003, 0.005, 0.014), h);
  sky += vec3(0.070, 0.042, 0.030) * pow(1.0 - h, 7.0);

  // the unresolved band, drifting very slowly
  float band = exp(-pow((uv.y - uv.x * 0.42 + 0.06) * 2.7, 2.0));
  float haze = fbm(uv * 3.4 + vec2(u_time * 0.01, 0.0));
  sky += vec3(0.090, 0.096, 0.135) * band * (0.25 + 0.75 * haze);

  // A real sky is not spread evenly, and past a certain distance the eye stops
  // resolving points at all. So only three lattices are drawn, and the faintest
  // is gated hard: it appears where the sky is genuinely rich and nowhere else.
  // Everything beyond that is carried by the glow above, not by more dots.
  float crowd = clamp(band * (0.30 + 0.70 * haze)
                    + 0.35 * fbm(uv * 2.3 + 9.0) - 0.16, 0.0, 1.0);
  crowd *= crowd;

  float s  = layer(uv, 11.0, 0.00060, 0.70,  0.0);
  s       += layer(uv, 27.0, 0.00040, 0.70, 19.0) * 0.80;
  s       += layer(uv, 62.0, 0.00110, 0.56, 57.0) * crowd * 0.55;

  // stars are not all the same colour
  vec3 tint = mix(vec3(0.72, 0.82, 1.00), vec3(1.00, 0.90, 0.76),
                  0.5 + 0.5 * sin(uv.x * 6.3 + uv.y * 4.1));

  vec3 col = sky + tint * s + vec3(0.9, 0.95, 1.0) * meteor(uv);

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
    slug: 'ripples',
    title: 'Water',
    note: 'Click or drag on the water. Each touch starts a ring that travels outward and flattens as it goes, and the surface is the sum of every live ring plus a slow swell. The tilt of that surface bends the view of the tiled floor, which is the whole trick: there is no water, only a floor being looked at through a wobbly lens. A drop falls on its own every few seconds.',
    source: ripples
  },
  {
    slug: 'stars',
    title: 'Night sky',
    note: 'Three lattices of stars, near to far, each cell holding a candidate. Twinkling is the atmosphere rather than the star, so most of them sit perfectly still and only a few per cent shimmer, driven by two detuned sines multiplied together so the flicker stays irregular. The faintest lattice is gated by a noise field so it appears only where the sky is genuinely rich, because a field spread evenly reads as film grain rather than as sky. Everything further away is carried by the band of unresolved light instead of by more dots, which is also how your eye handles it. A meteor crosses every seventh second.',
    source: stars
  },
  {
    slug: 'raymarch',
    title: 'Raymarched sphere',
    note: 'Signed distance fields and sphere tracing. The scene is one function returning how far the nearest surface is, and the renderer walks along each ray by exactly that much. Normals come from the gradient, shadows from a second march toward the light.',
    source: raymarch
  }
];
