import Script from 'next/script';
import type { ReactNode } from 'react';
import { legacyDocument } from '@/lib/legacy/parse';

export default function RootLayout({ children }: { children: ReactNode }) {
  const { headHtml } = legacyDocument();
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* The legacy <head> (meta, links, styles, JSON-LD) is reproduced verbatim. */}
      <head dangerouslySetInnerHTML={{ __html: headHtml }} />
      <body>
        {children}
        <Script id="js-class" strategy="beforeInteractive">{`document.documentElement.classList.add('js');`}</Script>
        <Script src="https://t.contentsquare.net/uxa/ac861b4839f2e.js" strategy="afterInteractive" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VSMD3VS5NK" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-VSMD3VS5NK');`}</Script>
        <Script type="module" src="/js/entry.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
