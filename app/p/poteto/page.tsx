import type { Metadata } from 'next';
import { PotetoIsland } from '@/components/poteto/island';

const title = 'poteto';
const tagline =
  'An opinionated Hyprland desktop built around a dynamic island.';
const description =
  'poteto is a Hyprland desktop shell written in Quickshell and QML, built around one pill at the top of the screen that grows into a control center and morphs into the launcher, clipboard, wallpaper switcher, theme switcher and power menu.';
const repo = 'https://github.com/Itxsahil/poteto';

export const metadata: Metadata = {
  title: 'poteto — a Hyprland desktop built around a dynamic island',
  description,
  alternates: { canonical: '/p/poteto' },
  openGraph: {
    type: 'article',
    url: '/p/poteto',
    title: 'poteto — a Hyprland desktop built around a dynamic island',
    description,
    siteName: "Sahil Khan's portfolio",
    images: [{ url: '/p/poteto/opengraph-image', width: 1200, height: 630, alt: title }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'poteto — a Hyprland desktop built around a dynamic island',
    description,
    creator: '@sahilkhan_dev',
    images: [{ url: '/p/poteto/opengraph-image', width: 1200, height: 630, alt: title }]
  }
};

export default function Poteto() {
  return (
    <article>
      <h1 className="font-bold text-4xl pt-12 mb-0">{title}</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 mb-8 font-mono">
        Quickshell · QML · Hyprland · Lua
      </p>

      <p className="text-gray-800 dark:text-zinc-300 tracking-tight">{tagline}</p>

      <PotetoIsland />

      <h2 className="text-gray-800 dark:text-zinc-200 font-medium mt-10 mb-3 text-2xl">
        The idea
      </h2>
      <p className="text-gray-800 dark:text-zinc-300 tracking-tight">
        Most desktop shells scatter their controls: a bar along one edge, a
        launcher in the middle of the screen, a notification daemon somewhere
        else, a power menu of its own. poteto puts all of it in one place. A
        single pill sits at the top of the screen showing Wi-Fi strength, the
        time and the battery. Hovering it grows it into a control center.
        Pressing a keybind morphs the same pill into the launcher, the
        clipboard history, the wallpaper picker, the theme switcher or the
        power menu. Nothing new appears; one object changes shape.
      </p>
      <p className="text-gray-800 dark:text-zinc-300 tracking-tight">
        That constraint is what makes it interesting to build. Every feature
        has to justify its space inside a pill, and every transition between
        views has to read as the same object moving rather than one panel
        replacing another.
      </p>

      <h2 className="text-gray-800 dark:text-zinc-200 font-medium mt-10 mb-3 text-2xl">
        How it is put together
      </h2>
      <ul className="text-gray-800 dark:text-zinc-300 pl-5 space-y-1 list-[square]">
        <li className="pl-1">
          <strong className="font-bold">The shell</strong> is Quickshell and
          QML, split into modules: island, control center, launcher, clipboard,
          notifications, wallpaper, themes, power, screenshot, and an IPC layer.
        </li>
        <li className="pl-1">
          <strong className="font-bold">Hyprland</strong> is configured in Lua
          rather than the usual conf syntax, so workspace clicks in the shell
          dispatch straight into the compositor.
        </li>
        <li className="pl-1">
          <strong className="font-bold">Themes reach further than the shell.</strong>{' '}
          One switch restyles Quickshell, Hyprland borders, kitty, NvChad, VS
          Code, hyprlock and the wallpaper together. Each theme is a folder of
          per-application colour files generated from one palette.
        </li>
        <li className="pl-1">
          <strong className="font-bold">It owns the notification bus.</strong>{' '}
          Quickshell registers as the freedesktop notification daemon itself,
          so popups appear under the island with icons, images and actions.
        </li>
      </ul>

      <h2 className="text-gray-800 dark:text-zinc-200 font-medium mt-10 mb-3 text-2xl">
        See it running
      </h2>
      <p className="text-gray-800 dark:text-zinc-300 tracking-tight">
        The recreation above is a faithful mock, not the real thing. A screen
        recording of the shell itself goes here.
      </p>
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 p-8 text-center text-sm text-gray-400 dark:text-gray-500 font-mono">
        drop a screen capture at /public/poteto/demo.mp4
      </div>

      <p className="mt-10">
        <a href={repo} target="_blank" rel="noopener noreferrer">
          Read the source on GitHub
        </a>
      </p>
    </article>
  );
}
