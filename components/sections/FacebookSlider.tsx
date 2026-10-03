import type { Fields } from '@/lib/content/sections/facebook-slider';

type Slide = Fields['slides'][number];

function PlayIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <path d="M20 17L32 24L20 31V17Z" fill="currentColor" />
    </svg>
  );
}

function FacadeButton({ slide, facadeLabel }: { slide: Slide; facadeLabel: string }) {
  return (
    <button
      type="button"
      className="fb-facade"
      data-src={slide.src}
      data-title={slide.title}
      data-width={slide.width}
      data-height={slide.height}
      aria-label={`${facadeLabel}: ${slide.title}`}
    >
      <span className="fb-facade-icon" aria-hidden="true">
        <PlayIcon />
      </span>
      <span className="fb-facade-text">{facadeLabel}</span>
    </button>
  );
}

export default function FacebookSlider({ fields }: { fields: Fields }) {
  return (
    <section id="facebook-slider" className="section facebook-slider-section reveal">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <p className="section-subtitle">{fields.subtitle}</p>
        <div className="fb-slider-container">
          <button type="button" className="fb-nav-btn prev" aria-label={fields.prevLabel}>
            <i data-lucide="chevron-right"></i>
          </button>
          <div className="fb-slider-wrapper" id="fbSliderWrapper">
            {fields.slides.map((slide) => (
              <div key={slide.title} className={`fb-slide ${slide.kind}-slide`}>
                <FacadeButton slide={slide} facadeLabel={fields.facadeLabel} />
              </div>
            ))}
          </div>
          <button type="button" className="fb-nav-btn next" aria-label={fields.nextLabel}>
            <i data-lucide="chevron-left"></i>
          </button>
          <div className="fb-dots" id="fbDots"></div>
        </div>
      </div>
    </section>
  );
}
