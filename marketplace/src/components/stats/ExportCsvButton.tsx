'use client';

import { NeonButton } from '@/components/ui/NeonButton';
import { Download } from 'lucide-react';

export interface CsvRow {
  id: string;
  name: string;
  category: string;
  installs: number;
  last7d: number;
  last24h: number;
  safetyScore: number | null;
}

function toCsv(rows: CsvRow[]): string {
  const header = ['id', 'name', 'category', 'installs', 'last_7d', 'last_24h', 'safety_score'];
  const body = rows.map((r) =>
    [
      r.id,
      JSON.stringify(r.name),
      r.category,
      r.installs,
      r.last7d,
      r.last24h,
      r.safetyScore ?? '',
    ].join(',')
  );
  return [header.join(','), ...body].join('\n');
}

export function ExportCsvButton({ rows }: { rows: CsvRow[] }) {
  function download() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grokagents-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  return (
    <NeonButton
      variant="secondary"
      size="sm"
      onClick={download}
      leadingIcon={<Download className="h-4 w-4" />}
    >
      Export CSV
    </NeonButton>
  );
}
