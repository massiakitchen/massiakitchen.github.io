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

export async function boot() {
  installLifecycleReplay();
  for (const src of LIBS) await loadScript(src);
  await legacy('actions');
  await legacy('main');
  await legacy('calculator');
  await legacy('form-handler');
  await legacy('scrollytelling');
  if (window.lucide) window.lucide.createIcons();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}

if (typeof window !== 'undefined' && !window.__massiaNoBoot) boot();
