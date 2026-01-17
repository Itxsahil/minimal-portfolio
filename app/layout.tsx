import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans_Devanagari, Inter, JetBrains_Mono, STIX_Two_Text } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ContactButton } from '@/components/form-toggle';

const inter = Inter({ subsets: ['latin'] });
const ibm_Mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const metadata: Metadata = {
  title: "Sahil Khan – Full-Stack Developer & Technical Writer",
  description:
    "Explore the portfolio of Sahil Khan, a passionate Full-Stack Developer and Technical Writer. Showcasing web development projects, insightful blog posts, and creative problem solving with modern tech stacks.",
  keywords: [
    "Sahil Khan",
    "Full-Stack Developer",
    "Web Developer",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "Technical Writer",
    "Frontend Developer",
    "Backend Developer",
    "Portfolio",
    "Software Engineer",
  ],
  metadataBase: new URL("https://portfolio.stilldrx.deno.net"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  openGraph: {
    title: "Sahil Khan",
    description:
      "Full-Stack Developer & Technical Writer. Showcasing web development projects, insightful blog posts, and creative problem solving with modern tech stacks.",
    images: [
      {
        url: "https://portfolio.stilldrx.deno.net/og/home-og.png",
        width: 800,
        height: 600,
        alt: "Sahil Khan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahil Khan",
    description:
      "Full-Stack Developer & Technical Writer. Showcasing web development projects, insightful blog posts, and creative problem solving with modern tech stacks.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    title: "Sahil Khan",
    statusBarStyle: "default",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${stix.className} ${stix.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-8 dark:bg-neutral-900 bg-white text-gray-900 dark:text-zinc-200">
          <main className="max-w-2xl mx-auto my-auto w-full space-y-6">
            {children}
          </main>
          <Footer />
          <ContactButton/>
          <Analytics />
        </div>
      </body>
    </html>
  );
}

function Footer() {
  const links = [
    { name: 'x/twitter', url: 'https://x.com/sahilkhan_dev' },
    { name: 'peerlist', url: 'https://peerlist.io/itxsahil' },
    { name: 'github', url: 'https://github.com/itxsahil' }
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
            className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors duration-200"
          >
            {link.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
