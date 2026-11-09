
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Niman Prints | Business OS',
    template: '%s | Niman Prints',
  },
  description:
    'Niman Prints Business OS — manage orders, products, customers, production, inventory, finance and AI automation.',
  applicationName: 'Niman Prints',
  keywords: [
    'Niman Prints',
    'Printing Business Management',
    'Customized Gifts',
    'Business Management System',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090B12',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
