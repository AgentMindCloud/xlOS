'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { CATEGORY_LABELS, CERTIFICATION_LABELS } from '@/lib/constants';
import type { Category, Certification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Check, Copy, Github } from 'lucide-react';
import { useMemo, useState } from 'react';

const MAX_NAME = 60;
const MAX_TAGLINE = 120;
const MAX_REPO = 80;
const MAX_YAML = 4000;

interface Form {
  name: string;
  tagline: string;
  repo: string;
  category: Category | '';
  certifications: Certification[];
  yaml: string;
  handle: string;
}

export function SubmitForm() {
  const [form, setForm] = useState<Form>({
    name: '',
    tagline: '',
    repo: '',
    category: '',
    certifications: [],
    yaml: '',
    handle: '',
  });
  const [copied, setCopied] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const prBody = useMemo(() => buildPrBody(form), [form]);
  const prUrl = useMemo(
    () =>
      `https://github.com/AgentMindCloud/awesome-grok-agents/compare/main...main?quick_pull=1&title=${encodeURIComponent(
        `Add agent: ${form.name || '<agent-name>'}`
      )}&body=${encodeURIComponent(prBody)}`,
    [form.name, prBody]
  );

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCert(c: Certification) {
    setForm((f) => ({
      ...f,
      certifications: f.certifications.includes(c)
        ? f.certifications.filter((x) => x !== c)
        : [...f.certifications, c],
    }));
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(prBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <Field label="Agent name" required error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value.slice(0, MAX_NAME))}
            placeholder="Post Autopilot"
            className={inputClass}
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Tagline" required error={errors.tagline} help="One sentence, ≤120 chars.">
          <input
            value={form.tagline}
            onChange={(e) => update('tagline', e.target.value.slice(0, MAX_TAGLINE))}
            placeholder="Drafts, schedules, and publishes Grok-aware threads on X."
            className={inputClass}
            aria-invalid={!!errors.tagline}
          />
        </Field>
        <Field
          label="GitHub repo"
          required
          error={errors.repo}
          help="owner/repo format — we’ll link to this from the listing."
        >
          <input
            value={form.repo}
            onChange={(e) => update('repo', e.target.value.slice(0, MAX_REPO))}
            placeholder="your-org/your-agent"
            className={inputClass}
            aria-invalid={!!errors.repo}
          />
        </Field>
        <Field label="X / GitHub handle" help="Optional, for the creator profile.">
          <input
            value={form.handle}
            onChange={(e) => update('handle', e.target.value.slice(0, 60))}
            placeholder="@yourhandle"
            className={inputClass}
          />
        </Field>

        <Field label="Category" required error={errors.category}>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <Pill
                key={c}
                active={form.category === c}
                onClick={() => update('category', form.category === c ? '' : c)}
              >
                {CATEGORY_LABELS[c]}
              </Pill>
            ))}
          </div>
        </Field>

        <Field label="Certifications" help="Pick any that apply. We’ll verify before merging.">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CERTIFICATION_LABELS) as Certification[]).map((c) => (
              <Pill key={c} active={form.certifications.includes(c)} onClick={() => toggleCert(c)}>
                {CERTIFICATION_LABELS[c]}
              </Pill>
            ))}
          </div>
        </Field>

        <Field
          label="Manifest YAML"
          required
          error={errors.yaml}
          help="grok-agent.yaml / grok-voice.yaml / grok-swarm.yaml"
        >
          <textarea
            value={form.yaml}
            onChange={(e) => update('yaml', e.target.value.slice(0, MAX_YAML))}
            placeholder={'apiVersion: grokinstall.dev/v1\nkind: Agent\nmetadata:\n  id: your-agent'}
            rows={10}
            className={cn(inputClass, 'font-mono text-[13px] leading-6 resize-y')}
            aria-invalid={!!errors.yaml}
          />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <NeonButton
            variant="primary"
            size="lg"
            href={isValid ? prUrl : '#'}
            external={isValid}
            leadingIcon={<Github className="h-4 w-4" />}
            trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            className={cn(!isValid && 'opacity-50 pointer-events-none')}
            aria-disabled={!isValid}
          >
            Open pre-filled PR
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="lg"
            onClick={onCopy}
            leadingIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? 'Copied markdown' : 'Copy PR body'}
          </NeonButton>
        </div>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <GlassCard padding="lg" className="relative overflow-hidden flex flex-col gap-3">
          <div className="absolute inset-x-0 top-0 plate-divider" aria-hidden />
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-aurora">Preview</p>
          <h3 className="font-display text-xl tracking-tight text-ink">
            {form.name || 'Your agent name'}
          </h3>
          <p className="text-sm text-ink-muted">
            {form.tagline || 'A one-line tagline goes here.'}
          </p>
          {form.certifications.length ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.certifications.map((c) => (
                <span
                  key={c}
                  className="inline-flex rounded-sm border border-plasma/40 bg-plasma/5 text-plasma px-2 py-0.5 text-[11px]"
                >
                  {CERTIFICATION_LABELS[c]}
                </span>
              ))}
            </div>
          ) : null}
        </GlassCard>

        <GlassCard padding="md" className="text-xs text-ink-muted leading-relaxed">
          <p className="text-ink">How it works</p>
          <ol className="mt-2 space-y-1 text-ink-subtle list-decimal list-inside">
            <li>Fill in the fields on the left.</li>
            <li>Click “Open pre-filled PR” — GitHub opens with the PR body ready.</li>
            <li>Finish the PR title, hit Create, we review weekly.</li>
          </ol>
        </GlassCard>
      </aside>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5 border-0 p-0">
      <legend className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.18em] text-aurora mb-1">
        {label}
        {required ? <span className="text-plasma">*</span> : null}
      </legend>
      {children}
      {help ? <span className="text-[11px] text-ink-subtle">{help}</span> : null}
      {error ? <span className="text-[11px] text-danger">{error}</span> : null}
    </fieldset>
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
        'inline-flex rounded-sm border px-2.5 py-1 text-xs font-medium transition-all duration-150 ease-gi',
        active
          ? 'border-plasma bg-plasma/10 text-plasma shadow-plasmaGlowSoft'
          : 'border-border-subtle bg-surface text-ink-muted hover:border-aurora/50 hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}

const inputClass = cn(
  'w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5',
  'text-sm text-ink placeholder:text-ink-subtle',
  'focus:outline-none focus:border-plasma/50 focus:shadow-plasmaGlowSoft transition-all'
);

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.name.trim()) e.name = 'Required';
  if (!f.tagline.trim()) e.tagline = 'Required';
  if (!f.repo.trim()) e.repo = 'Required';
  else if (!/^[^/\s]+\/[^/\s]+$/.test(f.repo.trim())) e.repo = 'Use owner/repo format.';
  if (!f.category) e.category = 'Pick a category';
  if (!f.yaml.trim()) e.yaml = 'Paste your manifest';
  return e;
}

function buildPrBody(f: Form): string {
  const certs = f.certifications.length ? f.certifications.join(', ') : '_none yet_';
  const handle = f.handle.trim() ? f.handle.trim() : '_not provided_';
  const yamlFence = f.yaml.trim()
    ? `\`\`\`yaml\n${f.yaml.trim()}\n\`\`\``
    : '_paste manifest here_';
  return `## Agent submission

**Name:** ${f.name || '<name>'}
**Tagline:** ${f.tagline || '<tagline>'}
**Repo:** ${f.repo ? `https://github.com/${f.repo}` : '<owner/repo>'}
**Creator handle:** ${handle}
**Category:** ${f.category || '<category>'}
**Certifications:** ${certs}

### Manifest

${yamlFence}

---

- [ ] I am the creator or have permission to submit this agent
- [ ] The repo is public and MIT/Apache-2.0 licensed
- [ ] The YAML validates against the grok-yaml-standards schemas
`;
}
