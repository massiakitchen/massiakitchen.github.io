// Runs legacy handlers declared as data-action="fn" data-args='[...]' (converted from inline on* attributes).
// Mirrors native inline-handler semantics: every ancestor handler runs inner -> outer unless propagation stops;
// a handler returning false cancels the default action.
const ALLOWED = new Set([
  'closeGalleryModal', 'closeLightbox', 'closePremiumModal', 'loadMoreGalleryItems', 'navigateGallery',
  'nextReview', 'openGalleryModal', 'prevReview', 'requestDetailedQuote', 'resetGalleryZoom',
  'zoomGalleryImage', 'handleForm',
]);

function dispatch(event, kind) {
  let el = event.target instanceof Element ? event.target : null;
  while (el && el !== document.documentElement) {
    if (el.hasAttribute('data-action') && (el.getAttribute('data-action-event') || 'click') === kind) {
      const name = el.getAttribute('data-action');
      const fn = window[name];
      if (ALLOWED.has(name) && typeof fn === 'function') {
        const args = JSON.parse(el.getAttribute('data-args') || '[]').map((a) => (a === '$event' ? event : a));
        const result = fn.apply(el, args);
        if (result === false) event.preventDefault();
      }
      if (event.cancelBubble) return;
    }
    el = el.parentElement;
  }
}

document.addEventListener('click', (e) => dispatch(e, 'click'));
document.addEventListener('submit', (e) => dispatch(e, 'submit'));
window.__massiaActions = ALLOWED;
