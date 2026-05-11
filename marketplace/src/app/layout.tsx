import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Plausible } from '@/components/layout/Plausible';
import { SkipToContent } from '@/components/layout/SkipToContent';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { BRAND } from '@/lib/brand';
import { DISCLAIMER, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/constants';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: BRAND.bg,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — The community marketplace for Grok-native agents on X`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'Discover, install, and ship Grok-native agents. A community marketplace for agents certified Grok-Native, Safety-Max, Voice-Ready, and Swarm-Ready.',
  applicationName: SITE_NAME,
  keywords: [
    'grok',
    'grok agents',
    'xai',
    'x app',
    'agents marketplace',
    'grok-native',
    'voice agents',
    'swarm agents',
  ],
  authors: [{ name: 'AgentMindCloud', url: 'https://github.com/AgentMindCloud' }],
  creator: '@JanSol0s',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DISCLAIMER,
    siteName: SITE_NAME,
    images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@JanSol0s',
    creator: '@JanSol0s',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: 'The community marketplace for Grok-native agents on X.',
    images: ['/og-default.svg'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-ink min-h-dvh font-body antialiased">
        <ThemeProvider>
          <SkipToContent />
          <Header />
          <main id="content" className="pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Plausible />
      </body>
    </html>
  );
}
