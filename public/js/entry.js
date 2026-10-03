// Loads the legacy scripts after React hydration, in the original order.
// Legacy code registers DOMContentLoaded/load listeners at import time; those events have already fired
// by now, so late listeners are invoked once, asynchronously, exactly like the browser would have.
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js',
  'https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js',
];

export function installLifecycleReplay(doc = document, win = window) {
  const patch = (target, type, isPast) => {
    const original = target.addEventListener.bind(target);
    target.addEventListener = function (t, listener, options) {
      if (t === type && isPast()) {
        queueMicrotask(() => {
          const ev = new Event(type);
          typeof listener === 'function' ? listener.call(target, ev) : listener.handleEvent(ev);
        });
        return;
      }
      return original(t, listener, options);
    };
  };
  patch(doc, 'DOMContentLoaded', () => doc.readyState !== 'loading');
  patch(win, 'load', () => doc.readyState === 'complete');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

// Specifier is built at runtime so bundlers (vite/vitest import analysis) leave
// these browser-only imports untouched; in the browser this is exactly
// import('/js/<name>.js'). This file is served as-is from /public, never bundled.
const legacy = (name) => import(`/js/${name}.js`);

// Lucide swaps <i data-lucide> placeholders for <svg>. If that runs while
// React is still hydrating, hydration reverts the converted tail nodes back
// to <i> and they stay broken (visitors see missing icons; the legacy page
// has no hydration so it never hits this). Convert only once the main thread
// has gone idle past hydration, then once more after window load to catch
// any straggler. Re-running createIcons is safe: converted nodes are skipped.
export function applyIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// requestIdleCallback fires once hydration work has drained off the main
// thread; setTimeout fallback where rIC is unavailable.
export function afterHydration(callback) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => callback(), { timeout: 2500 });
  } else {
    setTimeout(callback, 500);
  }
}

// Runs callback once after window load (idle-scheduled); heals any icon
// that was converted and reverted before hydration finished.
export function onceAfterWindowLoad(callback) {
  if (document.readyState === 'complete') {
    afterHydration(callback);
    return;
  }
  window.addEventListener('load', () => afterHydration(callback), { once: true });
}

export async function boot() {
  installLifecycleReplay();
  for (const src of LIBS) await loadScript(src);
  await legacy('actions');
  await legacy('main');
  await legacy('calculator');
  await legacy('form-handler');
  await legacy('scrollytelling');
  afterHydration(applyIcons);
  onceAfterWindowLoad(applyIcons);
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}

if (typeof window !== 'undefined' && !window.__massiaNoBoot) boot();
