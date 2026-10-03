import type { Fields } from '@/lib/content/sections/why-us';

export default function WhyUs({ fields }: { fields: Fields }) {
  return (
    <section id="why-us" className="section why-us-section reveal">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <p className="section-subtitle">{fields.subtitle}</p>

        <div className="why-us-grid">
          {fields.cards.map((c) => (
            <div className="why-us-card" key={c.icon}>
              <div className="why-us-icon">
                <i data-lucide={c.icon} className="premium-icon gold lg"></i>
              </div>
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        <div className="trust-footer">
          <div className="rating-display card">
            <div className="rating-stars">
              {Array.from({ length: fields.rating.stars }).map((_, i) => (
                <i key={i} data-lucide="star" className="premium-icon gold sm fill"></i>
              ))}
            </div>
            <h4>{fields.rating.score}</h4>
            <p>{fields.rating.reviewsText}</p>
            <p>{fields.rating.recommendText}</p>
          </div>

          <div className="booking-system card">
            <h4>{fields.booking.title}</h4>
            <form className="booking-form">
              <label htmlFor={fields.booking.nameInputId} className="sr-only">
                {fields.booking.nameLabel}
              </label>
              <input
                type="text"
                id={fields.booking.nameInputId}
                name={fields.booking.nameInputId}
                placeholder={fields.booking.nameLabel}
                required
                aria-label={fields.booking.nameLabel}
              />
              <label htmlFor={fields.booking.phoneInputId} className="sr-only">
                {fields.booking.phoneLabel}
              </label>
              <input
                type="tel"
                id={fields.booking.phoneInputId}
                name={fields.booking.phoneInputId}
                placeholder={fields.booking.phoneLabel}
                required
                aria-label={fields.booking.phoneLabel}
              />
              <button type="submit" className="btn btn-primary btn-full">
                {fields.booking.submitLabel}
              </button>
            </form>
            <p className="note">{fields.booking.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
