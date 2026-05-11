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
        'glass flex items-center gap-2 rounded-md px-3 h-11 transition-colors',
        'focus-within:border-plasma/50 focus-within:shadow-plasmaGlowSoft',
        className
      )}
    >
      <Search className="h-4 w-4 text-ink-subtle shrink-0" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-sm text-ink placeholder:text-ink-subtle"
        aria-label="Search agents"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-ink-subtle hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
