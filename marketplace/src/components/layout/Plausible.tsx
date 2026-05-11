import Script from 'next/script';

export function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? 'https://plausible.io';
  if (!domain) return null;
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`${host}/js/script.tagged-events.js`}
        data-domain={domain}
      />
      <Script id="plausible-queue" strategy="afterInteractive">
        {
          'window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}'
        }
      </Script>
    </>
  );
}
