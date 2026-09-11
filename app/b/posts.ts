export type Post = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, used for sorting. Keep it in sync with the date shown in the post. */
  date: string;
};

const allPosts: Post[] = [
  {
    slug: '1',
    title: 'Trying to Find My Words Again',
    description:
      'A personal reflection on rediscovering the habit of reading and writing.',
    date: '2025-10-08'
  },
  {
    slug: '2',
    title: 'Observability: Monitoring Node.js with Prometheus, Grafana & Loki',
    description:
      'A practical guide to observability in Node.js — setting up Prometheus, Grafana, and Loki to monitor, log, and debug production servers effectively.',
    date: '2025-07-24'
  },
  {
    slug: '3',
    title: 'JavaScript Array Methods: Implementing Core Methods',
    description:
      'How map, filter, reduce, and forEach work under the hood, by implementing them from scratch on Array.prototype.',
    date: '2025-06-01'
  },
  {
    slug: '4',
    title: 'Unlocking Metaprogramming in JavaScript: Proxies and Reflect',
    description:
      'Intercepting and customizing fundamental object operations with the ES6 Proxy and Reflect APIs.',
    date: '2025-05-25'
  },
  {
    slug: '5',
    title: 'Understanding WebRTC — Real-Time Communication in the Browser',
    description:
      'A deep dive into WebRTC, covering NAT traversal, STUN, TURN, ICE, SDP, and how browsers connect peer-to-peer without servers.',
    date: '2025-09-27'
  },
  {
    slug: '6',
    title: 'The Beauty of Small Code: Why Overengineering Is an Addiction',
    description:
      'Why simple code beats complex code, the psychology of overengineering, and how small code leads to clarity.',
    date: '2025-09-27'
  },
  {
    slug: '7',
    title: 'Why a MacBook Sometimes Outperforms a Laptop With a Dedicated GPU',
    description:
      'Architecture, efficiency, and why I still choose Linux over everything.',
    date: '2026-05-27'
  },
  {
    slug: '8',
    title: 'Why We Resist Being Told What to Read',
    description:
      'Reactance, the curiosity gap, and why ownership is what makes learning stick.',
    date: '2026-09-10'
  }
];

/** Newest first. Ties break on slug so the order is stable across builds. */
export const posts: Post[] = [...allPosts].sort(
  (a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug)
);

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

export function formatPostDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function postYear(date: string) {
  return date.slice(0, 4);
}
