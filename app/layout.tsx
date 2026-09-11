import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans_Devanagari, Inter, JetBrains_Mono, STIX_Two_Text } from 'next/font/google';
import { ContactButton } from '@/components/form-toggle';
import { ThemePicker } from '@/components/theme/theme-picker';
import { einkFontVariables } from '@/components/theme/fonts';
import { READING_SIZE, STORAGE_KEY, THEMES } from '@/components/theme/themes';
import Script  from 'next/script';
import { Analytics } from '@vercel/analytics/next';
const inter = Inter({ subsets: ['latin'] });
const ibm_Mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const metadata: Metadata = {
  title: "Sahil Khan – Full-Stack Developer & Technical Writer",
  description:
    "Explore the portfolio of Sahil Khan, a passionate Full-Stack Developer and Technical Writer. Showcasing web development projects, insightful blog posts, and creative problem solving with modern tech stacks.",
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Sahil Khan', url: 'https://www.sahilkhan.site' }],
  creator: 'Sahil Khan',
  openGraph: {
    type: 'website',
    title: "Sahil Khan – Full-Stack Developer & Technical Writer",
    description:
      "Full-Stack Developer & Technical Writer. Showcasing web development projects, insightful blog posts, and creative problem solving with modern tech stacks.",
    url: "https://www.sahilkhan.site",
    siteName: "Sahil Khan's portfolio",
    images: [
      {
        url: '/og/home.png',
        width: 2400,
        height: 1260,
        alt: 'Sahil Khan — Engineer & Writer',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahil Khan – Full-Stack Developer & Technical Writer",
    description:
      "Full-Stack Developer & Technical Writer. Showcasing web development projects, insightful blog posts, and creative problem solving with modern tech stacks.",
    images: ['/og/home.png'],
    site: "@sahilkhan_dev",
    creator: "@sahilkhan_dev",
  },
  metadataBase: new URL("https://www.sahilkhan.site"),
};
const stix = STIX_Two_Text({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-stix-two-text",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
// Painted before first paint, so a reader who chose a theme never sees the
// default site flash first.
const themeScript = `(function(){try{
var ids=${JSON.stringify(THEMES.map((t) => t.id))};
var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||'{}');
if(ids.indexOf(s.theme)<0)return;
var n=typeof s.size==='number'?Math.min(${READING_SIZE.max},Math.max(${READING_SIZE.min},s.size)):${READING_SIZE.default};
var r=document.documentElement;
r.setAttribute('data-theme',s.theme);
r.setAttribute('data-dropcap',s.dropCap===true?'on':'off');
r.setAttribute('data-frontlight',s.frontlight===false?'off':'on');
r.style.setProperty('--reading-size',n+'px');
}catch(e){}})();`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${stix.className} ${stix.variable} ${einkFontVariables}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <div className="min-h-dvh overflow-x-clip flex flex-col justify-between pt-0 md:pt-8 p-8 bg-paper text-text">
          
          <main className="max-w-2xl mx-auto my-auto w-full space-y-6">
            {children}
          </main>
          <Footer />
        </div>
        <Script src="/oneko/oneko.js" data-cat="/oneko/oneko.gif"/>
        <Analytics />
        <ContactButton/>
        <ThemePicker />
      </body>
    </html>
  );
}

function Footer() {
  const links = [
    { name: 'x/twitter', url: '/x' },
    { name: 'peerlist', url: '/pl' },
    { name: 'github', url: '/github' },
    { name: 'linkedin', url: '/ln' }
  ];

  return (
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-link transition-colors duration-200"
          >
            {link.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
