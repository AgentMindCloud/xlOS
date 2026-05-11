export function SkipToContent() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
        focus:rounded-sm focus:bg-cyan focus:px-3 focus:py-1.5 focus:text-bg focus:font-medium
        focus:shadow-cyanGlow"
    >
      Skip to content
    </a>
  );
}
