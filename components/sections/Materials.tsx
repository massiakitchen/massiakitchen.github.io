import type { Fields } from '@/lib/content/sections/materials';

type Media = Fields['categories'][number]['items'][number]['media'];
type MaterialItem = Fields['categories'][number]['items'][number];

function MediaImg({ media }: { media: Media }) {
  const img = (
    <img
      decoding={media.img.decoding as 'async' | 'sync' | 'auto'}
      src={media.img.src}
      srcSet={media.img.srcset}
      alt={media.img.alt}
      width={media.img.width}
      height={media.img.height}
      loading={media.img.loading as 'eager' | 'lazy'}
    />
  );
  if (media.kind === 'picture') {
    return (
      <picture>
        <source srcSet={media.source.srcset} type={media.source.type} sizes={media.source.sizes} />
        {img}
      </picture>
    );
  }
  return img;
}

function MaterialCard({ item, clickHint }: { item: MaterialItem; clickHint: Fields['clickHint'] }) {
  return (
    <div
      className="price-item clickable-material"
      tabIndex={0}
      role="button"
      data-pros={item.pros.join('|')}
      data-cons={item.cons.join('|')}
    >
      <div className="card-bg-image">
        <MediaImg media={item.media} />
      </div>
      <div className="card-content">
        <div className="price-header">
          <h5>{item.title}</h5>
          <div className={`price-badge ${item.badgeTone}`}>{item.badgeText}</div>
        </div>
        <div className="click-hint">
          <i data-lucide={clickHint.icon} className="hint-icon"></i> {clickHint.text}
        </div>
      </div>
    </div>
  );
}

export default function Materials({ fields }: { fields: Fields }) {
  const byTab = new Map(fields.categories.map((c) => [c.tabId, c]));
  const tabClass = (id: string) =>
    `cu-tab-content${fields.tabs.find((t) => t.id === id)?.active ? ' active' : ''}`;
  return (
    <section id="materials" className="section materials-prices">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <div className="cu-tabs-container">
          {fields.tabs.map((t) => (
            <button key={t.id} type="button" className="cu-tab-btn" data-target={t.id}>
              {t.label}
              {t.icon ? (
                <>
                  {' '}<i data-lucide={t.icon} className="premium-icon flame sm"></i>
                </>
              ) : null}
            </button>
          ))}
        </div>
        <div id="materials-content-wrapper">
          <div id="tab-offers" className={tabClass('tab-offers')}>
            <div className="special-offers card">
              <div className="offer-header">
                <h4>{fields.offersHeader.title}</h4>
                <div className="offer-badge">
                  <i data-lucide={fields.offersHeader.badgeIcon} className="premium-icon flame sm"></i>{' '}
                  {fields.offersHeader.badgeText}
                </div>
              </div>
              <div className="offers-grid">
                {fields.offers.map((o) => (
                  <div key={o.title} className="offer-item">
                    <div className="offer-content">
                      <h5>{o.title}</h5>
                      <p className="offer-discount">{o.discount}</p>
                      <p className="offer-desc">{o.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {fields.tabs
            .filter((t) => t.id !== 'tab-offers' && byTab.has(t.id))
            .map((t) => {
              const cat = byTab.get(t.id)!;
              return (
                <div key={t.id} id={t.id} className={tabClass(t.id)}>
                  <div className="material-category">
                    <div className="category-header">
                      <h4 className="category-title">{cat.title}</h4>
                      <span className="category-badge">
                        <i data-lucide={cat.badgeIcon} className="premium-icon gold sm"></i> {cat.badgeText}
                      </span>
                    </div>
                    <div className="pricing-grid enhanced-grid">
                      {cat.items.map((item) => (
                        <MaterialCard key={item.title} item={item} clickHint={fields.clickHint} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
