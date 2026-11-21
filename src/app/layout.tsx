/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AppShell } from '@/components/layout/AppShell';
import { THEME_SCRIPT } from '@/lib/theme-script';
import '@/styles/index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'SceneTone',
  description:
    'SceneTone turns a creative scene brief into a structured soundscape blueprint and helps producers interpret objective audio measurements.',
  icons: {
    icon: [
      { url: '/logo-mark-dark.webp', media: '(prefers-color-scheme: light)', type: 'image/webp' },
      { url: '/logo-mark-light.webp', media: '(prefers-color-scheme: dark)', type: 'image/webp' },
    ],
    apple: '/logo-mark-dark.webp',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Iosevka+Charon+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=smart_toy&display=swap"
          rel="stylesheet"
        />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
