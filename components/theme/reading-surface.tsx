'use client';

import { usePathname } from 'next/navigation';

/** Marks article prose for the theme layer. The writings index lives at /b and
 *  is a listing, not prose, so it stays out. */
export function ReadingSurface({ children }: { children: React.ReactNode }) {
  const segments = (usePathname() ?? '').replace(/\/+$/, '').split('/').filter(Boolean);
  const isArticle = segments.length === 2 && segments[0] === 'b';
  return <div className={isArticle ? 'reading-surface' : undefined}>{children}</div>;
}
