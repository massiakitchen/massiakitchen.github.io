// Verbatim <head> remainder from legacy/index.html: everything the layout does
// not generate from settings (meta, preconnects, stylesheets, preloads, icons,
// manifest, inline critical CSS, <noscript>). Explicit JSX so the runtime no
// longer reads legacy/ for the head; lib/legacy/parse.ts stays for tests only.
// Props are listed in legacy source order so the served markup is unchanged.

const CRITICAL_CSS = `
    /* Critical CSS for above-the-fold content (gated on html.js so content shows if JS is disabled) */
    html.js .header,
    html.js .hero,
    html.js .scrolly-section {
      opacity: 0;
    }

    html.js .loaded .header,
    html.js .loaded .hero,
    html.js .loaded .scrolly-section {
      opacity: 1;
      transition: opacity 0.5s ease;
    }

    /* Preserve section-title styling after h3.gold-title -> h2.gold-title (mirrors .section h3 in css/main.css) */
    .section h2.gold-title {
      color: var(--gold);
      font-size: 1.8rem;
      margin-bottom: 18px;
      position: relative;
      display: inline-block;
      padding-bottom: 8px;
    }

    /* Screen-reader-only utility for form labels */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: white;
      padding: 8px;
      z-index: 10000;
      text-decoration: none;
      border-radius: 4px;
    }

    .skip-link:focus {
      top: 6px;
    }
  `;

const NOSCRIPT_CSS = `
      #preloader {
        display: none !important;
      }
      html.js .header,
      html.js .hero,
      html.js .scrolly-section,
      .header,
      .hero,
      .scrolly-section {
        opacity: 1 !important;
      }
    `;

export function HeadStatic() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="google-site-verification" content="eM8vXK66ttKTFWgZRHTbz94pf1FaCQ_uwD_UauZD3xk" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      <link rel="preconnect" href="https://unpkg.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
        rel="stylesheet"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href="./css/vars.css" />
      <link rel="stylesheet" href="./css/animations.css" />
      <link rel="stylesheet" href="./css/components.css" />
      <link rel="stylesheet" href="./css/facebook-feed.css" />
      <link rel="stylesheet" href="./css/main.css" />
      <link rel="stylesheet" href="./css/responsive.css" />
      <link rel="stylesheet" href="./css/scrollytelling.css" />
      <link rel="preload" href="images/logo-light.webp" as="image" />
      <link rel="preload" href="images/logo-dark.webp" as="image" />
      <link
        rel="preload"
        as="image"
        type="image/webp"
        href="images/Aluminum/massia1-1-600.webp"
        imageSrcSet="images/Aluminum/massia1-1-600.webp 600w, images/Aluminum/massia1-1.webp 1200w"
        imageSizes="300px"
      />
      <link rel="icon" type="image/png" href="images/icon-192.png" />
      <link rel="apple-touch-icon" href="images/apple-touch-icon.png" />
      <link rel="manifest" href="manifest.json" />
      <meta name="theme-color" content="#d4af37" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="الماسية للمطابخ" />
      <meta name="author" content="الماسية للمطابخ" />
      <meta name="copyright" content="شركة الماسية للمطابخ - جميع الحقوق محفوظة" />
      <style>{CRITICAL_CSS}</style>
      <noscript>{'\n    '}<style>{NOSCRIPT_CSS}</style>{'\n  '}</noscript>
    </>
  );
}
