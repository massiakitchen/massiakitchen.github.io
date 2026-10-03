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
