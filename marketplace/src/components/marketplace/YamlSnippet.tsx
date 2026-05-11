import { cn } from '@/lib/utils';
import { codeToHtml } from 'shiki';

/**
 * Server component. Uses Shiki's dual-theme highlighting with a dark-plus base.
 * Rendered HTML is safe (generated from the known content string via Shiki's
 * trusted output, no user HTML).
 */
export async function YamlSnippet({
  code,
  filename,
  lang = 'yaml',
  className,
}: {
  code: string;
  filename?: string;
  lang?: 'yaml' | 'bash' | 'typescript' | 'json';
  className?: string;
}) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark-default',
  });

  return (
    <figure
      className={cn(
        'overflow-hidden rounded-md border border-border-subtle bg-bg font-mono text-sm',
        className
      )}
    >
      {filename ? (
        <figcaption className="flex items-center justify-between border-b border-border-subtle bg-bg/60 px-4 py-2">
          <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-cyan">
            {filename}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-ink-subtle">
            {lang}
          </span>
        </figcaption>
      ) : null}
      <div
        className="[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-4 overflow-x-auto text-[13px]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki output
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
