// @vitest-environment jsdom
import { beforeAll, describe, expect, test, vi } from 'vitest';

beforeAll(async () => {
  await import('../../public/js/actions.js');
});

describe('actions dispatcher', () => {
  test('runs inner then outer handler with args and event', () => {
    const calls: unknown[] = [];
    (window as any).openGalleryModal = (id: string, ev: Event) => calls.push(['open', id, ev.type]);
    (window as any).closeLightbox = () => calls.push(['close']);
    document.body.innerHTML = `<div data-action="closeLightbox" data-args="[]"><b data-action="openGalleryModal" data-args='["w1","$event"]'><i id="t"></i></b></div>`;
    document.getElementById('t')!.click();
    expect(calls).toEqual([['open', 'w1', 'click'], ['close']]);
  });

  test('stopPropagation inside a handler stops outer handlers', () => {
    const outer = vi.fn();
    (window as any).closeLightbox = outer;
    (window as any).openGalleryModal = (_id: string, ev: Event) => ev.stopPropagation();
    document.body.innerHTML = `<div data-action="closeLightbox" data-args="[]"><b id="t" data-action="openGalleryModal" data-args='["w1","$event"]'></b></div>`;
    document.getElementById('t')!.click();
    expect(outer).not.toHaveBeenCalled();
  });

  test('submit returning false prevents default; non-allowed names are ignored', () => {
    (window as any).handleForm = () => false;
    (window as any).evil = vi.fn();
    document.body.innerHTML = `<form id="f" data-action="handleForm" data-args='["$event"]' data-action-event="submit"><button id="b" data-action="evil" data-args="[]">x</button></form>`;
    const ev = new Event('submit', { bubbles: true, cancelable: true });
    document.getElementById('f')!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    document.getElementById('b')!.click();
    expect((window as any).evil).not.toHaveBeenCalled();
  });
});
