import type { Fields } from '@/lib/content/sections/reviews';

type Review = Fields['items'][number];

function ReviewCard({ item, stars, ratingLabel }: { item: Review; stars: number; ratingLabel: string }) {
  return (
    <div className={item.active ? 'review-card active' : 'review-card'}>
      <div className="review-content">
        <div className="rating-stars" role="img" aria-label={ratingLabel}>
          {Array.from({ length: stars }).map((_, i) => (
            <i key={i} data-lucide="star" className="premium-icon gold sm fill"></i>
          ))}
        </div>
        <p className="review-text">{item.text}</p>
        <div className="review-author">
          <div className="customer-avatar">
            <span>{item.initials}</span>
          </div>
          <div className="author-info">
            <strong>{item.name}</strong>
            <span>{item.meta}</span>
            <div className="review-date">{item.date}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reviews({ fields }: { fields: Fields }) {
  return (
    <section id="reviews" className="section reviews reveal">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <p className="section-description">{fields.description}</p>

        <div className="reviews-container">
          <div className="reviews-slider">
            <div className="slider-container">
              <div className="slider-track" id="sliderTrack">
                {fields.items.map((item) => (
                  <ReviewCard key={item.name} item={item} stars={fields.ratingStars} ratingLabel={fields.ratingLabel} />
                ))}
              </div>
            </div>

            <button type="button" className="slider-nav prev" data-action="prevReview" data-args="[]" aria-label={fields.prevLabel}>
              <i data-lucide="chevron-right"></i>
            </button>
            <button type="button" className="slider-nav next" data-action="nextReview" data-args="[]" aria-label={fields.nextLabel}>
              <i data-lucide="chevron-left"></i>
            </button>

            <div className="slider-indicators">
              {fields.items.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  className={item.active ? 'indicator active' : 'indicator'}
                  data-slide={i}
                  aria-label={`${fields.indicatorLabel} ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        <div className="reviews-stats">
          <div className="stats-grid">
            {fields.stats.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-number">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-cta">
          <h4>{fields.cta.title}</h4>
          <p>{fields.cta.text}</p>
          <div className="cta-buttons">
            <a href={fields.cta.primaryHref} className="btn btn-primary">{fields.cta.primaryLabel}</a>
            <a href={fields.cta.secondaryHref} className="btn btn-ghost">{fields.cta.secondaryLabel}</a>
          </div>
        </div>

      </div>
    </section>
  );
}
