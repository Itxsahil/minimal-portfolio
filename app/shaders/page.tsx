import type { Metadata } from 'next';
import { ShaderCanvas } from '@/components/shaders/shader-canvas';
import { ShaderSource } from '@/components/shaders/shader-source';
import { SHADERS } from '@/components/shaders/sources';

const title = 'Shaders';
const description =
  'Seven fragment shaders running in the browser, with the GLSL that produces them. Plasma, domain-warped noise, Voronoi cells, water, a night sky, a raymarched sphere and a mechanical typewriter.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/shaders' },
  openGraph: {
    type: 'website',
    url: '/shaders',
    title,
    description,
    siteName: "Sahil Khan's portfolio",
    images: [{ url: '/shaders/opengraph-image', width: 1200, height: 630, alt: title }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@sahilkhan_dev',
    images: [{ url: '/shaders/opengraph-image', width: 1200, height: 630, alt: title }]
  }
};

export default function Shaders() {
  return (
    <section>
      <h1 className="font-bold text-4xl pt-12 mb-0">{title}</h1>
      <p className="text-gray-800 dark:text-zinc-300 tracking-tight">
        A fragment shader is a small program that runs once for every pixel and
        answers one question: what colour are you? It is given the pixel&rsquo;s
        position and the time, and nothing else. No geometry, no textures, no
        memory of the pixel next door. Everything below is drawn from those two
        numbers.
      </p>
      <p className="text-gray-800 dark:text-zinc-300 tracking-tight">
        Each one runs live, and the water responds to a click or a drag. The
        source under each is the exact string being compiled, not a
        transcription, so it cannot fall out of step with what you are looking
        at.
      </p>

      {SHADERS.map((shader) => (
        <div key={shader.slug} className="mt-12">
          <h2
            id={shader.slug}
            className="text-gray-800 dark:text-zinc-200 font-medium mt-8 mb-3 text-2xl"
          >
            {shader.title}
          </h2>
          <p className="text-gray-800 dark:text-zinc-300 tracking-tight">
            {shader.note}
          </p>
          <ShaderCanvas source={shader.source} title={shader.title} />
          <ShaderSource source={shader.source} title={shader.title} />
        </div>
      ))}

      <p className="mt-12 text-sm text-gray-400 dark:text-gray-500">
        They pause when scrolled out of view, when the tab is hidden, and when
        your system asks for reduced motion.
      </p>
    </section>
  );
}
