// Static page shells with no editable content: reproduced verbatim from legacy/index.html.
// Inline onclick handlers appear in their converted data-action/data-args form.

export function Preloader() {
  return (
    <div id="preloader" aria-hidden="true">
      <div className="preloader-content">
        <div className="preloader-logo">
          <picture>
            <source srcSet="images/logo-light.webp" type="image/webp" />
            <img
              decoding="async"
              src="images/logo-light.png"
              alt="الماسية للمطابخ"
              width="150"
              height="75"
              className="logo-animate"
            />
          </picture>
        </div>
        <div className="progress-wrapper">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" id="progressBar" style={{ width: '0%' }}></div>
          </div>
          <div className="loading-stats">
            <span className="percentage" id="progressText">
              0%
            </span>
            <span className="loading-message">جاري التحميل...</span>
          </div>
          <div id="slowNetworkMsg" className="slow-network-msg hidden" style={{ display: 'none' }}>
            <i data-lucide="wifi-off" className="premium-icon gold sm"></i>
            <span>الشبكة بطيئة قليلاً، يرجى الانتظار...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Lightbox() {
  return (
    <div
      id="lightbox"
      className="lightbox"
      aria-hidden="true"
      data-action="closeLightbox"
      data-args={JSON.stringify([])}
    >
      <img id="lightboxImg" src="" alt="صورة مكبرة" aria-describedby="lightbox-desc" />
      <p id="lightbox-desc" className="sr-only">
        صورة مكبرة من معرض الأعمال
      </p>
      <button
        type="button"
        className="close-lightbox"
        data-action="closeLightbox"
        data-args={JSON.stringify([])}
        aria-label="إغلاق"
      >
        <i data-lucide="x"></i>
      </button>
    </div>
  );
}

export function GalleryModal() {
  return (
    <div
      id="galleryModal"
      className="gallery-modal"
      aria-hidden="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalProjectTitle"
    >
      <div
        className="gallery-modal-overlay"
        data-action="closeGalleryModal"
        data-args={JSON.stringify([])}
      ></div>
      <div className="gallery-modal-content">
        <button
          type="button"
          className="gallery-close"
          data-action="closeGalleryModal"
          data-args={JSON.stringify([])}
          aria-label="إغلاق المعرض"
        >
          <i data-lucide="x"></i>
        </button>
        <div className="gallery-zoom-container">
          <button
            type="button"
            className="btn-zoom"
            data-action="zoomGalleryImage"
            data-args={JSON.stringify([1.2])}
            aria-label="تكبير الصورة"
          >
            <i data-lucide="zoom-in"></i>
          </button>
          <button
            type="button"
            className="btn-zoom"
            data-action="zoomGalleryImage"
            data-args={JSON.stringify([1 / 1.2])}
            aria-label="تصغير الصورة"
          >
            <i data-lucide="zoom-out"></i>
          </button>
          <button
            type="button"
            className="btn-zoom"
            data-action="resetGalleryZoom"
            data-args={JSON.stringify([])}
            aria-label="إعادة ضبط الحجم"
          >
            <i data-lucide="maximize"></i>
          </button>
        </div>
        <div className="gallery-slider">
          <div className="slider-main" id="modalSliderMain"></div>
          <button
            type="button"
            className="slider-nav-btn prev"
            data-action="navigateGallery"
            data-args={JSON.stringify([-1])}
            aria-label="السابق"
          >
            <i data-lucide="chevron-right" className="premium-icon md"></i>
          </button>
          <button
            type="button"
            className="slider-nav-btn next"
            data-action="navigateGallery"
            data-args={JSON.stringify([1])}
            aria-label="التالي"
          >
            <i data-lucide="chevron-left" className="premium-icon md"></i>
          </button>
          <div className="image-counter" id="imageCounter">
            1 / 3
          </div>
        </div>
        <div className="gallery-thumbnails" id="galleryThumbnails"></div>
        <div className="modal-project-info">
          <h3 className="modal-project-title" id="modalProjectTitle"></h3>
          <p className="modal-project-description" id="modalProjectDescription"></p>
        </div>
      </div>
    </div>
  );
}

export function MaterialBubble() {
  return (
    <div id="materialBubble" className="material-bubble" role="tooltip">
      <div className="bubble-arrow"></div>
      <button type="button" id="closeBubbleBtn" className="close-bubble-btn">
        <i data-lucide="x"></i>
      </button>
      <div className="bubble-header">
        <h3 id="bubbleTitle">عنوان الخامة</h3>
        <span id="bubbleSubtitle" className="bubble-badge">
          وصف
        </span>
      </div>
      <div className="bubble-content-grid">
        <div className="bubble-column pros">
          <h5>
            <i data-lucide="check-circle" className="icon-success sm"></i> المميزات
          </h5>
          <ul id="bubbleProsList"></ul>
        </div>
        <div className="bubble-column cons">
          <h5>
            <i data-lucide="alert-circle" className="icon-warning sm"></i> ملاحظات
          </h5>
          <ul id="bubbleConsList"></ul>
        </div>
      </div>
    </div>
  );
}

export function PremiumModal() {
  return (
    <div
      id="premiumModal"
      className="premium-modal"
      aria-hidden="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div
        className="premium-modal-overlay"
        data-action="closePremiumModal"
        data-args={JSON.stringify([])}
      ></div>
      <div className="premium-modal-container">
        <div className="premium-modal-header">
          <h3 id="modalTitle">تنبيه</h3>
          <button
            type="button"
            className="premium-modal-close"
            data-action="closePremiumModal"
            data-args={JSON.stringify([])}
            aria-label="إغلاق"
          >
            <i data-lucide="x"></i>
          </button>
        </div>
        <div className="premium-modal-body">
          <div id="modalIcon" className="modal-icon-wrapper"></div>
          <div id="modalMessage"></div>
        </div>
        <div className="premium-modal-footer" id="modalFooter"></div>
      </div>
    </div>
  );
}
