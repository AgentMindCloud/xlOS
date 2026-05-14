'use client';

import { CATEGORY_LABELS, CERTIFICATION_LABELS, SORT_OPTIONS } from '@/lib/constants';
import type { Category, Certification, SortKey } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function FilterPills({
  categories,
  certifications,
  sort,
  onToggleCategory,
  onToggleCertification,
  onSort,
  onClear,
}: {
  categories: Category[];
  certifications: Certification[];
  sort: SortKey;
  onToggleCategory: (c: Category) => void;
  onToggleCertification: (c: Certification) => void;
  onSort: (s: SortKey) => void;
  onClear: () => void;
}) {
  const anyActive = categories.length > 0 || certifications.length > 0 || sort !== 'trending';

  return (
    <div className="flex flex-col gap-4">
      <FilterGroup label="Sort">
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <Pill key={opt.value} active={sort === opt.value} onClick={() => onSort(opt.value)}>
              {opt.label}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Certifications">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CERTIFICATION_LABELS) as Certification[]).map((c) => (
            <Pill
              key={c}
              active={certifications.includes(c)}
              onClick={() => onToggleCertification(c)}
            >
              {CERTIFICATION_LABELS[c]}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Categories">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <Pill key={c} active={categories.includes(c)} onClick={() => onToggleCategory(c)}>
              {CATEGORY_LABELS[c]}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      {anyActive ? (
        <button
          type="button"
          onClick={onClear}
          className="self-start font-mono text-xs text-ink-600 hover:text-cinnabar-400 underline-offset-4 hover:underline transition-colors"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cinnabar-400">
        {label}
      </span>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-xs font-mono font-medium transition-all duration-150 ease-gi',
        active
          ? 'cinnabar-gradient-soft border-cinnabar-500/40 text-cinnabar-300 shadow-cinnabar-glow-soft'
          : 'bg-ink-100 border-ink-300/60 text-ink-700 hover:border-cinnabar-400/40 hover:text-ink-900'
      )}
    >
      {active ? <Check className="h-3 w-3" /> : null}
      <span>{children}</span>
    </button>
  );
}
