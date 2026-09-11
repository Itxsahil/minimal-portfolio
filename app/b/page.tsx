import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPostDate, posts, postYear } from './posts';

const title = 'Writings';
const description =
  'Essays and notes by Sahil Khan on web development, JavaScript, infrastructure, and the occasional detour.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/b' },
  openGraph: {
    type: 'website',
    url: '/b',
    title,
    description,
    siteName: "Sahil Khan's portfolio",
    images: [{ url: '/b/opengraph-image', width: 1200, height: 630, alt: title }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@sahilkhan_dev',
    images: [{ url: '/b/opengraph-image', width: 1200, height: 630, alt: title }]
  }
};

const years = [...new Set(posts.map((post) => postYear(post.date)))];

export default function Writings() {
  return (
    <section>
      <h1 className="font-bold text-4xl pt-12 mb-0">{title}</h1>
      <p className="text-text tracking-tight">
        {posts.length} posts, newest first.
      </p>

      {years.map((year) => (
        <div key={year} className="mt-10">
          <h2 className="text-sm font-mono text-muted mb-4">
            {year}
          </h2>

          <div className="flex flex-col space-y-5">
            {posts
              .filter((post) => postYear(post.date) === year)
              .map((post) => (
                <article key={post.slug}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <Link
                      href={`/b/${post.slug}`}
                      className="no-underline hover:text-ink transition-colors"
                    >
                      {post.title}
                    </Link>
                    <time
                      dateTime={post.date}
                      className="text-sm text-muted tabular-nums shrink-0"
                    >
                      {formatPostDate(post.date)}
                    </time>
                  </div>
                  <p className="text-sm text-muted tracking-tight mb-0 mt-1">
                    {post.description}
                  </p>
                </article>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
