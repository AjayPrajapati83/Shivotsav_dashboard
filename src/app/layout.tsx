import type { Metadata, Viewport } from 'next';
import { Cinzel, Cinzel_Decorative, Inter } from 'next/font/google';
import './globals.css';
import { BRANDING } from '@/config/branding';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: BRANDING.fullTitle,
  description: BRANDING.description,
  manifest: '/manifest.json',
  icons: {
    icon: '/logos/SHIVOTSAV_LOGO.png',
    apple: '/logos/SHIVOTSAV_LOGO.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f59e0b', // Amber-500
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cinzelDecorative.variable} ${inter.variable}`}>
      <body className="font-inter antialiased min-h-dvh">
        {children}
      </body>
    </html>
  );
}
