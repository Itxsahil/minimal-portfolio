import { ReadingSurface } from '@/components/theme/reading-surface';

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ReadingSurface>{children}</ReadingSurface>;
}
