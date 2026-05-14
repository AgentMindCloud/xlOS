import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Plausible } from '@/components/layout/Plausible';
import { SkipToContent } from '@/components/layout/SkipToContent';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { DISCLAIMER, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/constants';
import type { Metadata, Viewport } from 'next';
import { Geist, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
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
      className={`${geistSans.variable} ${ibmPlexMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-ink min-h-dvh font-sans antialiased">
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
