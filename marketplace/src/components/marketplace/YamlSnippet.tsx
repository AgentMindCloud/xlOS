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
      className={cn('overflow-hidden rounded-md glass-card-strong font-mono text-sm', className)}
    >
      {filename ? (
        <figcaption className="flex items-center justify-between border-b border-ink-300/40 px-4 py-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cinnabar-400">
            {filename}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
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
