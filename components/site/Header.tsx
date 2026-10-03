import type { Settings } from '@/lib/content/settings';

export function SkipLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="skip-link">
      {label}
    </a>
  );
}

export function ThemeToggle({ label }: { label: string }) {
  return (
    <button type="button" className="theme-toggle" aria-label={label}>
      <i data-lucide="moon" className="premium-icon"></i>
    </button>
  );
}

export function Header({ settings }: { settings: Settings }) {
  const { brand, nav } = settings;
  return (
    <header className="site-header header">
      <div className="container header-inner">
        <div className="brand">
          <picture>
            <source srcSet={brand.logoLight.webp} type="image/webp" />
            <source srcSet={brand.logoLight.png} type="image/png" />
            <img
              decoding="async"
              src={brand.logoLight.png}
              alt={brand.logoLight.alt}
              className="logo logo-light"
              width="120"
              height="60"
              loading="eager"
            />
          </picture>
          <picture>
            <source srcSet={brand.logoDark.webp} type="image/webp" />
            <source srcSet={brand.logoDark.png} type="image/png" />
            <img
              decoding="async"
              src={brand.logoDark.png}
              alt={brand.logoDark.alt}
              className="logo logo-dark"
              width="120"
              height="60"
              style={{ display: 'none' }}
              loading="eager"
            />
          </picture>
          <div className="brand-text">
            <div className="logo-text fade-in-gold">{brand.title}</div>
            <p className="tagline">{brand.tagline}</p>
          </div>
        </div>
        <nav className="main-nav nav-menu" aria-label="القائمة الرئيسية">
          {nav.main.map((link) => (
            <a key={`${link.href}-${link.label}`} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="mobile-menu-btn"
          aria-expanded="false"
          aria-controls="mobile-menu"
          aria-label="قائمة الجوال"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div className="mobile-menu" id="mobile-menu">
        {nav.mobile.map((link) => (
          <a key={`${link.href}-${link.label}`} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}
