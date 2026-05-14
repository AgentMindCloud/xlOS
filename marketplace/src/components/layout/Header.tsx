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
        scrolled ? 'glass-card border-b border-border-subtle !rounded-none' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg uppercase tracking-[-0.06em] transition-colors"
          aria-label="GrokInstall home"
        >
          <span className="text-ink-900">GROK</span>
          <span className="cinnabar-text">INSTALL</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as never}
              target={'external' in item && item.external ? '_blank' : undefined}
              rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
              className="rounded-sm px-3 py-2 text-sm text-ink-800 transition-colors hover:text-cinnabar-400 hover:underline hover:decoration-cinnabar-400/60 hover:underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border-subtle text-ink-900 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 glass-card-strong border-t border-border-subtle md:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4"
            aria-label="Primary mobile"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href as never}
                target={'external' in item && item.external ? '_blank' : undefined}
                rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
                className="rounded-sm px-3 py-3 text-base text-ink-800 transition-colors hover:text-cinnabar-400"
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
