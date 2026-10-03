import type { Fields } from '@/lib/content/sections/scrollytelling';

type Media = Fields['parallax'][number]['media'];

function MediaImg({ media }: { media: Media }) {
  const img = (
    <img
      loading={media.img.loading as 'eager' | 'lazy'}
      fetchPriority={media.img.fetchpriority as 'high' | undefined}
      decoding={media.img.decoding as 'async' | 'sync' | 'auto'}
      src={media.img.src}
      srcSet={media.img.srcset}
      sizes={media.img.sizes}
      alt={media.img.alt}
      width={media.img.width}
      height={media.img.height}
    />
  );
  if (media.kind === 'picture') {
    return (
      <picture>
        <source srcSet={media.source.srcset} sizes={media.source.sizes} type={media.source.type} />
        {img}
      </picture>
    );
  }
  return img;
}

export default function Scrollytelling({ fields }: { fields: Fields }) {
  return (
    <section className="scrolly-section" id="scrollytelling">
      <div className="scrolly-sticky">
        <div className="parallax-bg" id="scrolly-bg">
          {fields.parallax.map((p) => (
            <div key={p.cls} className={p.cls} data-speed={p.speed}>
              <MediaImg media={p.media} />
            </div>
          ))}
        </div>
        <div className="scrolly-content">
          <div className="scrolly-card glass">
            <div className="card-header-actions">
              <button type="button" className="theme-toggle hero-theme-toggle" aria-label="تبديل الوضع">
                <i data-lucide="moon" className="premium-icon"></i>
              </button>
            </div>
            <p className="white-heading">{fields.welcome}</p>
            <h1 className="gold-heading">{fields.title}</h1>
            <div className="trust-badges">
              {fields.badges.map((b) => (
                <div key={b.text} className="badge">
                  <i data-lucide={b.icon} className="premium-icon gold sm"></i>
                  {b.text}
                </div>
              ))}
            </div>
            <div className="card-footer-trust">
              {fields.footTrust.map((t) => (
                <span key={t.text}>
                  <i data-lucide={t.icon} className="premium-icon gold sm"></i> {t.text}
                </span>
              ))}
            </div>
            <div className="scrolly-actions">
              <a href={fields.cta.href} className="btn-animate-border">{fields.cta.text}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
