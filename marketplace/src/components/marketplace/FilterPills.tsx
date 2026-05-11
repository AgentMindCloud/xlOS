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
          className="self-start text-xs text-ink-subtle hover:text-ink underline-offset-4 hover:underline"
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
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-aurora">{label}</span>
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
        'inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-xs font-medium transition-all duration-150 ease-gi',
        active
          ? 'border-plasma bg-plasma/10 text-plasma shadow-plasmaGlowSoft'
          : 'border-border-subtle bg-surface text-ink-muted hover:border-aurora/50 hover:text-ink'
      )}
    >
      {active ? <Check className="h-3 w-3" /> : null}
      <span>{children}</span>
    </button>
  );
}
