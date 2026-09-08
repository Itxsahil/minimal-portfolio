import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const socialRedirects = [
  { source: '/x', destination: 'https://x.com/sahilkhan_dev' },
  { source: '/pl', destination: 'https://peerlist.io/itxsahil' },
  { source: '/github', destination: 'https://github.com/itxsahil' },
  {
    source: '/ln',
    destination: 'https://www.linkedin.com/in/sahil-khan-545b5b227/'
  }
].map((r) => ({ ...r, permanent: false }));

const nextConfig: NextConfig = {
  pageExtensions: ['mdx', 'ts', 'tsx'],
  async redirects() {
    return socialRedirects;
  },
  // Note: Using the Rust compiler means we cannot use
  // rehype or remark plugins. If you need them, remove
  // the `experimental.mdxRs` flag.
  experimental: {
    mdxRs: true
  }
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
