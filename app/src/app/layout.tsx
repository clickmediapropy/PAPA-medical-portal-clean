import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Portal Médico v2',
  description: 'Panel médico para gestionar cronologías, laboratorio y medicaciones.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
  }

  return (
    <html lang="es">
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/login">
        <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 font-sans antialiased`}>
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
