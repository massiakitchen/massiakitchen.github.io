import type { Fields } from '@/lib/content/sections/works';

type WorkItem = Fields['items'][number];

// Legacy renders data-images as '["a", "b"]' (comma + space separators).
function dataImages(images: string[]): string {
  return `[${images.map((s) => JSON.stringify(s)).join(', ')}]`;
}

function WorkFigure({ item, cta }: { item: WorkItem; cta: string }) {
  const cls = `card item ${item.category}${item.extraClass ? ` ${item.extraClass}` : ''} reveal gallery-item${item.hidden ? ' gallery-item-hidden' : ''}`;
  return (
    <figure
      className={cls}
      data-gallery-id={item.galleryId}
      data-title={item.title}
      data-description={item.description}
      data-images={dataImages(item.images)}
      data-video={item.video}
      tabIndex={0}
      role="button"
      data-action="openGalleryModal"
      data-args={JSON.stringify([item.galleryId, '$event'])}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-bg-image">
        <picture>
          <source srcSet={item.cover.webp} type="image/webp" />
          <img
            width={item.cover.width}
            height={item.cover.height}
            loading={item.cover.loading as 'eager' | 'lazy'}
            decoding={item.cover.decoding as 'async' | 'sync' | 'auto'}
            src={item.cover.src}
            alt={item.cover.alt}
          />
        </picture>
      </div>
      <div className="card-content">
        <div className="works-cta">{cta}</div>
      </div>
    </figure>
  );
}

export default function Works({ fields }: { fields: Fields }) {
  return (
    <section id="works" className="section works reveal">
      <div className="container">
        <h2 className="gold-title">{fields.title}</h2>
        <div className="filter-container">
          {fields.filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className={f.active ? 'filter-btn active' : 'filter-btn'}
              data-filter={f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="skeleton-grid" id="skeletonGrid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton skeleton-image"></div>
          ))}
        </div>
        <div className="grid gallery-grid" id="galleryGrid" style={{ display: 'none' }}>
          {fields.items.map((item) => (
            <WorkFigure key={item.galleryId} item={item} cta={fields.cardCta} />
          ))}
        </div>
        <div className="load-more-container" id="loadMoreContainer" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            id="loadMoreBtn"
            data-action="loadMoreGalleryItems"
            data-args="[]"
          >
            <i data-lucide="plus-circle" className="premium-icon sm" style={{ marginInlineEnd: '0.5rem' }}></i>
            {fields.loadMore.label}
          </button>
        </div>
      </div>
    </section>
  );
}
