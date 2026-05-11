'use client';

import { AccentButton } from '@/components/ui/AccentButton';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Github, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-200 ease-gi',
        scrolled ? 'backdrop-blur-gi bg-bg/75 border-b border-plasma/15' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-[-0.06em] uppercase text-ink hover:text-aurora transition-colors"
          aria-label="GrokInstall home"
        >
          <span className="text-ink">GROK</span>
          <span className="text-plasma text-glow-plasma">INSTALL</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as never}
              target={'external' in item && item.external ? '_blank' : undefined}
              rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
              className="px-3 py-2 text-sm text-ink-muted hover:text-ink rounded-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <AccentButton
            variant="secondary"
            size="sm"
            href="https://github.com/AgentMindCloud/grok-agents-marketplace"
            external
            leadingIcon={<Github className="h-4 w-4" />}
          >
            Star on GitHub
          </AccentButton>
          <AccentButton variant="primary" size="sm" href="/marketplace">
            Browse Agents
          </AccentButton>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border-subtle text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-border-subtle bg-bg/95 backdrop-blur-gi">
          <nav
            className="mx-auto flex max-w-7xl flex-col px-4 py-4 gap-1"
            aria-label="Primary mobile"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href as never}
                target={'external' in item && item.external ? '_blank' : undefined}
                rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
                className="px-3 py-3 text-base text-ink-muted hover:text-ink rounded-sm"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <AccentButton
                variant="secondary"
                size="md"
                href="https://github.com/AgentMindCloud"
                external
                fullWidth
              >
                GitHub
              </AccentButton>
              <AccentButton variant="primary" size="md" href="/marketplace" fullWidth>
                Browse
              </AccentButton>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
