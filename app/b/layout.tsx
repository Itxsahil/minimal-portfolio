// import type { Metadata } from 'next'

// export const metadata: Metadata = {
//   twitter: {
//     card: "summary_large_image",
//   },
// }

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}