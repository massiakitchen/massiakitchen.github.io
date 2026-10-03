import type { Fields } from '@/lib/content/sections/faq';

type FaqItem = Fields['items'][number];

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AnswerExtras({ item }: { item: FaqItem }) {
  return (
    <>
      {item.details.length > 0 && (
        <div className="answer-details">
          {item.details.map((d) => (
            <span key={d.text} className="detail-item"><i data-lucide={d.icon} className="premium-icon gold sm"></i> {d.text}</span>
          ))}
        </div>
      )}
      {item.badges.length > 0 && (
        <div className="answer-features">
          {item.badges.map((b) => (
            <div key={b} className="feature-badge">{b}</div>
          ))}
        </div>
      )}
      {item.materials.length > 0 && (
        <div className="materials-list">
          {item.materials.map((m) => (
            <div key={m.title} className="material-item">
              <strong>{m.title}</strong> {m.text}
            </div>
          ))}
        </div>
      )}
      {item.warranty.length > 0 && (
        <div className="warranty-features">
          {item.warranty.map((w) => (
            <div key={w.text} className="warranty-item">
              <span className="warranty-icon"><i data-lucide={w.icon} className="premium-icon gold sm"></i></span>
              <span>{w.text}</span>
            </div>
          ))}
        </div>
      )}
      {item.payments.length > 0 && (
        <div className="payment-options">
          {item.payments.map((p) => (
            <div key={p.title} className="payment-option">
              <strong>{p.title}</strong> {p.text}
            </div>
          ))}
        </div>
      )}
      {item.tags.length > 0 && (
        <div className="installation-features">
          {item.tags.map((tag) => (
            <span key={tag} className="feature-tag">{tag}</span>
          ))}
        </div>
      )}
    </>
  );
}

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <div className="faq-item" data-category={item.category}>
      <button type="button" className="faq-question" aria-expanded="false" aria-controls={item.controls}>
        <div className="question-content">
          <span className="question-icon"><i data-lucide={item.icon} className="premium-icon gold sm"></i></span>
          <span className="question-text">{item.question}</span>
        </div>
        <span className="faq-icon">
          <PlusIcon />
        </span>
      </button>
      <div className="faq-answer" id={item.answerId}>
        <div className="answer-content">
          <p>{item.answer}</p>
          <AnswerExtras item={item} />
        </div>
      </div>
    </div>
  );
}

export default function Faq({ fields }: { fields: Fields }) {
  return (
    <section id="faq" className="section faq reveal">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <p className="section-description">{fields.description}</p>

        <div className="faq-search">
          <label htmlFor="faqSearch" className="sr-only">{fields.searchLabel}</label>
          <input type="text" id="faqSearch" placeholder={fields.searchPlaceholder} className="search-input" />
          <i data-lucide="search" className="premium-icon gold sm search-icon-pos"></i>
          <div className="search-results" id="searchResults"></div>
        </div>

        <div className="faq-categories">
          {fields.categories.map((c) => (
            <button key={c.id} type="button" className={c.active ? 'category-btn active' : 'category-btn'} data-category={c.id}>{c.label}</button>
          ))}
        </div>

        <div className="faq-stats">
          {fields.stats.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="faq-grid">
          {fields.items.map((item) => (
            <FaqCard key={item.question} item={item} />
          ))}
        </div>

        <div className="faq-cta">
          <div className="cta-content">
            <h4>{fields.cta.title}</h4>
            <p>{fields.cta.text}</p>
            <div className="cta-buttons">
              <a dir="ltr" href={fields.cta.phoneHref} className="btn btn-primary">
                <i data-lucide="phone"></i> {fields.cta.phoneLabel}
              </a>
              <a href={fields.cta.whatsappHref} target="_blank" className="btn btn-ghost">
                <i data-lucide="message-square"></i> {fields.cta.whatsappLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
