'use client';

import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search agents, tags, creators…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass-card flex items-center gap-2 rounded-md px-3 h-11 transition-all',
        'focus-within:border-cinnabar-400/60 focus-within:shadow-cinnabar-glow-soft',
        className
      )}
    >
      <Search className="h-4 w-4 text-ink-600 shrink-0" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-sm font-mono text-ink-900 placeholder:text-ink-600 placeholder:font-mono"
        aria-label="Search agents"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-ink-600 hover:text-cinnabar-400 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
