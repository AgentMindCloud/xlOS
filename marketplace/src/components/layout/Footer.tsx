import { DISCLAIMER, SITE_TAGLINE } from '@/lib/constants';
import { BookOpen, Github, Package, Twitter } from 'lucide-react';
import Link from 'next/link';

const COLS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: 'Marketplace',
    links: [
      { href: '/marketplace', label: 'Browse agents' },
      { href: '/marketplace/sections/trending', label: 'Trending' },
      { href: '/marketplace/sections/voice', label: 'Voice-ready' },
      { href: '/marketplace/sections/swarm', label: 'Swarm-ready' },
      { href: '/marketplace/sections/new', label: 'New' },
      { href: '/marketplace/sections/beginner', label: 'Start here' },
      { href: '/hall-of-fame', label: 'Hall of Fame' },
      { href: '/stats', label: 'Stats' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      {
        href: 'https://github.com/AgentMindCloud/grok-install',
        label: 'grok-install',
        external: true,
      },
      {
        href: 'https://github.com/AgentMindCloud/grok-yaml-standards',
        label: 'YAML standards',
        external: true,
      },
      {
        href: 'https://github.com/AgentMindCloud/vscode-grok-yaml',
        label: 'VS Code extension',
        external: true,
      },
      {
        href: 'https://github.com/AgentMindCloud/grok-install-action',
        label: 'GitHub Action',
        external: true,
      },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: 'https://docs.grokinstall.dev', label: 'Documentation', external: true },
      { href: 'https://github.com/sponsors/JanSol0s', label: 'Sponsor', external: true },
      { href: '/submit', label: 'Submit an agent' },
      { href: '/privacy', label: 'Privacy' },
      { href: 'https://x.com/JanSol0s', label: '@JanSol0s on X', external: true },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-border-subtle bg-ink-50/60 backdrop-blur-glass">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="font-display text-lg uppercase tracking-[-0.06em]">
              <span className="text-ink-900">GROK</span>
              <span className="cinnabar-text">INSTALL</span>
            </Link>
            <p className="mt-3 text-sm text-ink-700">{SITE_TAGLINE}</p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com/AgentMindCloud"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AgentMindCloud on GitHub"
                className="text-ink-600 transition-colors hover:text-cinnabar-400"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/JanSol0s"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="@JanSol0s on X"
                className="text-ink-600 transition-colors hover:text-cinnabar-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://docs.grokinstall.dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Documentation"
                className="text-ink-600 transition-colors hover:text-cinnabar-400"
              >
                <BookOpen className="h-5 w-5" />
              </a>
              <a
                href="https://www.npmjs.com/package/grok-install"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="npm package"
                className="text-ink-600 transition-colors hover:text-cinnabar-400"
              >
                <Package className="h-5 w-5" />
              </a>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm uppercase tracking-[0.18em] text-cinnabar-300">
                {col.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href as never}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-ink-700 transition-colors hover:text-cinnabar-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative mt-10 pt-6 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="plate-divider absolute inset-x-0 top-0" aria-hidden />
          <p className="max-w-xl text-xs text-ink-600">{DISCLAIMER}</p>
          <p className="mt-4 text-xs text-ink-600 sm:mt-0">
            © {year} GrokInstall · Built by{' '}
            <a
              href="https://x.com/JanSol0s"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cinnabar-400 hover:underline"
            >
              @JanSol0s
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
