// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';

describe('installLifecycleReplay', () => {
  test('replays late lifecycle listeners once', async () => {
    (window as any).__massiaNoBoot = true;
    const { installLifecycleReplay } = await import('../../public/js/entry.js');
    const doc = { readyState: 'complete', addEventListener: vi.fn() } as any;
    const win = { addEventListener: vi.fn() } as any;
    installLifecycleReplay(doc, win);
    const onReady = vi.fn();
    const onLoad = vi.fn();
    const onClick = vi.fn();
    doc.addEventListener('DOMContentLoaded', onReady);
    win.addEventListener('load', onLoad);
    doc.addEventListener('click', onClick);
    await Promise.resolve();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('does not replay while still loading', async () => {
    const { installLifecycleReplay } = await import('../../public/js/entry.js');
    const original = vi.fn();
    const doc = { readyState: 'loading', addEventListener: original } as any;
    installLifecycleReplay(doc, { addEventListener: vi.fn() } as any);
    const onReady = vi.fn();
    doc.addEventListener('DOMContentLoaded', onReady);
    await Promise.resolve();
    expect(onReady).not.toHaveBeenCalled();
    expect(original).toHaveBeenCalledWith('DOMContentLoaded', onReady, undefined);
  });
});

describe('post-hydration icon application', () => {
  test('applyIcons converts when lucide is present, no-ops when absent', async () => {
    const { applyIcons } = await import('../../public/js/entry.js');
    const createIcons = vi.fn();
    (window as any).lucide = { createIcons };
    applyIcons();
    expect(createIcons).toHaveBeenCalledTimes(1);
    delete (window as any).lucide;
    expect(() => applyIcons()).not.toThrow();
  });

  test('afterHydration uses requestIdleCallback when available', async () => {
    const { afterHydration } = await import('../../public/js/entry.js');
    const cb = vi.fn();
    const ric = vi.fn((_fn: Function) => 1);
    (window as any).requestIdleCallback = ric;
    afterHydration(cb);
    expect(ric).toHaveBeenCalledTimes(1);
    expect(cb).not.toHaveBeenCalled();
    delete (window as any).requestIdleCallback;
  });

  test('afterHydration falls back to setTimeout without requestIdleCallback', async () => {
    const { afterHydration } = await import('../../public/js/entry.js');
    expect((window as any).requestIdleCallback).toBeUndefined();
    vi.useFakeTimers();
    try {
      const cb = vi.fn();
      afterHydration(cb);
      expect(cb).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(cb).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test('onceAfterWindowLoad runs via idle scheduling when already complete', async () => {
    const { onceAfterWindowLoad } = await import('../../public/js/entry.js');
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
    vi.useFakeTimers();
    try {
      const cb = vi.fn();
      onceAfterWindowLoad(cb);
      vi.advanceTimersByTime(1000);
      expect(cb).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test('onceAfterWindowLoad waits for the load event when still loading', async () => {
    const { onceAfterWindowLoad } = await import('../../public/js/entry.js');
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
    vi.useFakeTimers();
    try {
      const cb = vi.fn();
      onceAfterWindowLoad(cb);
      vi.advanceTimersByTime(1000);
      expect(cb).not.toHaveBeenCalled();
      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(1000);
      expect(cb).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
      Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
    }
  });
});
