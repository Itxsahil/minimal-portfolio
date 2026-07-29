import type { Metadata } from 'next'

const siteName = "Sahil Khan's portfolio"
const twitterHandle = '@sahilkhan_dev'

type ArticleMetadata = {
  title: string
  description: string
  pathname: `/b/${string}`
}

export function createArticleMetadata({
  title,
  description,
  pathname,
}: ArticleMetadata): Metadata {
  const image = {
    url: `${pathname}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: title,
  }

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type: 'article',
      url: pathname,
      title,
      description,
      siteName,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: twitterHandle,
      images: [image],
    },
  }
}
