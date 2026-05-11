'use client';

import { cn } from '@/lib/utils';
import { Check, Code2, Copy, Terminal, Workflow } from 'lucide-react';
import { useState } from 'react';

type TabKey = 'cli' | 'vscode' | 'action';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'cli', label: 'CLI', icon: <Terminal className="h-3.5 w-3.5" /> },
  { key: 'vscode', label: 'VS Code', icon: <Code2 className="h-3.5 w-3.5" /> },
  { key: 'action', label: 'GitHub Action', icon: <Workflow className="h-3.5 w-3.5" /> },
];

export function InstallTabs({ agentId }: { agentId: string }) {
  const [tab, setTab] = useState<TabKey>('cli');
  const [copied, setCopied] = useState(false);

  const snippets: Record<TabKey, string> = {
    cli: `# Install the GrokInstall CLI, then run:\nnpx grok-install ${agentId}`,
    vscode: `# In VS Code:\n#   1. Install the “GrokInstall” extension from the Marketplace\n#   2. Cmd-Shift-P → “GrokInstall: Add agent”\n#   3. Paste the agent ID: ${agentId}`,
    action: `# .github/workflows/deploy.yml\n- uses: AgentMindCloud/grok-install-action@v1\n  with:\n    agent: ${agentId}\n    token: \${{ secrets.GROK_INSTALL_TOKEN }}`,
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippets[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="rounded-md border border-border-subtle bg-bg/40">
      <div className="flex items-center justify-between border-b border-border-subtle px-3">
        <div className="flex" role="tablist" aria-label="Install instructions">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
                'border-b-2 -mb-px',
                tab === t.key
                  ? 'border-cyan text-cyan'
                  : 'border-transparent text-ink-subtle hover:text-ink'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs text-ink-subtle hover:text-cyan"
          aria-label="Copy install command"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 font-mono text-ink-muted whitespace-pre">
        <code>{snippets[tab]}</code>
      </pre>
    </div>
  );
}
