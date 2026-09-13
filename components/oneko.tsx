'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Where the cat is allowed to roam. Articles are left alone so nothing
 *  wanders across the text while someone is reading. */
function catIsWelcome(pathname: string | null) {
  const path = (pathname ?? '').replace(/\/+$/, '') || '/';
  return path === '/' || path === '/b';
}

export function Oneko() {
  const welcome = catIsWelcome(usePathname());

  // oneko.js is an IIFE with no teardown, and next/script will not re-run it
  // once it has loaded, so leaving a route cannot unload the cat on its own.
  // The attribute hides it on the way into an article and brings it back on
  // the way out.
  useEffect(() => {
    const root = document.documentElement;
    if (welcome) root.removeAttribute('data-oneko-hidden');
    else root.setAttribute('data-oneko-hidden', '');
    return () => root.removeAttribute('data-oneko-hidden');
  }, [welcome]);

  // Skipping the tag on an article also means a reader who lands straight on
  // one never downloads the script at all.
  if (!welcome) return null;

  return <Script src="/oneko/oneko.js" data-cat="/oneko/oneko.gif" />;
}
