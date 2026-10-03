import Script from 'next/script';
import { createElement, type ReactNode } from 'react';
import { attrsToProps } from '@/lib/legacy/attrs';
import { headChildren } from '@/lib/legacy/parse';
import { loadSite } from '@/lib/content/load';
import { settingsSchema } from '@/lib/content/settings';
import type { Fields as FaqFields } from '@/lib/content/sections/faq';
import { faqJsonLd, localBusinessJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';

// Legacy-identical Open Graph / Twitter literals with no editable settings field yet
// (settings.seo only carries title/description/keywords/ogImage/url per the Phase 0 plan).
// Phase 3 can promote these into settings; values must stay identical to legacy/index.html.
const OG_TITLE = 'الماسية للمطابخ | تصميم وتنفيذ مطابخ - ضمان 10 سنوات';
const OG_DESCRIPTION =
  'تصميم وتنفيذ مطابخ الألومنيوم والخشب عالية الجودة في مصر - ضمان 10 سنوات - تركيب مجاني - تقسيط ميسر';
const OG_SITE_NAME = 'الماسية للمطابخ';
const OG_IMAGE_ALT = 'الماسية للمطابخ - تصميم وتنفيذ مطابخ';

// The rest of the legacy <head> (meta, links, inline styles, noscript) reproduced verbatim.
function HeadRemainder() {
  return (
    <>
      {headChildren().map((n, i) => {
        const props: Record<string, unknown> = { key: i, ...attrsToProps(n.attrs) };
        if (n.html) props.dangerouslySetInnerHTML = { __html: n.html };
        return createElement(n.tag, props);
      })}
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const site = loadSite();
  const settings = settingsSchema.parse(site.settings);
  const faq = site.sections.find((s) => s.id === 'faq')!.fields as FaqFields;
  const seo = settings.seo;
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.keywords ? <meta name="keywords" content={seo.keywords} /> : null}
        <link rel="canonical" href={seo.url} />
        <meta property="og:title" content={OG_TITLE} />
        <meta property="og:description" content={OG_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.url} />
        <meta property="og:site_name" content={OG_SITE_NAME} />
        <meta property="og:locale" content="ar_EG" />
        <meta property="og:image" content={seo.ogImage} />
        <meta property="og:image:secure_url" content={seo.ogImage} />
        <meta property="og:image:alt" content={OG_IMAGE_ALT} />
        <meta property="og:image:width" content={String(seo.ogImageWidth)} />
        <meta property="og:image:height" content={String(seo.ogImageHeight)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={OG_TITLE} />
        <meta name="twitter:description" content={OG_DESCRIPTION} />
        <meta name="twitter:image" content={seo.ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(settings)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(settings)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
        />
        <HeadRemainder />
      </head>
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
