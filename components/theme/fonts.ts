import { EB_Garamond, Inter, Literata, Newsreader } from 'next/font/google';

// Opt-in mode, so none of these preload. They download only once a reader
// actually picks the profile that uses them.
const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-eink-newsreader'
});

const literata = Literata({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-eink-literata'
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-eink-garamond'
});

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-eink-sans'
});

/** Class that exposes every reading font as a CSS variable. */
export const einkFontVariables = [
  newsreader.variable,
  literata.variable,
  garamond.variable,
  sans.variable
].join(' ');
