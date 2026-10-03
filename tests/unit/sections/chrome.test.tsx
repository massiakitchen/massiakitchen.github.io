// @ts-ignore -- no @types/react-dom in this phase; the runtime import below is valid
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { settingsSchema } from '@/lib/content/settings';
import settingsContent from '@/content/settings.json';
import { Header, SkipLink, ThemeToggle } from '@/components/site/Header';
import { Footer, WhatsappButton } from '@/components/site/Footer';
import {
  GalleryModal,
  Lightbox,
  MaterialBubble,
  PremiumModal,
  Preloader,
} from '@/components/site/Overlays';
import { expectSameHtml, legacyOuterHtml, normalizeHtml } from '../dom-equal';

const settings = settingsSchema.parse(settingsContent);

describe('chrome', () => {
  test('skip link renders exactly the legacy markup', () => {
    expectSameHtml(
      renderToStaticMarkup(
        <SkipLink href={settings.chrome.skipLink.href} label={settings.chrome.skipLink.label} />,
      ),
      'skip-link',
    );
  });

  test('preloader renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Preloader />), 'preloader');
  });

  test('header renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Header settings={settings} />), 'site-header');
  });

  test('theme toggle renders exactly the legacy markup', () => {
    expectSameHtml(
      renderToStaticMarkup(<ThemeToggle label={settings.chrome.themeToggleLabel} />),
      'theme-toggle',
    );
  });

  test('footer renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Footer settings={settings} />), 'site-footer');
  });

  test('whatsapp button renders exactly the legacy markup', () => {
    expectSameHtml(
      renderToStaticMarkup(
        <WhatsappButton
          href={`https://wa.me/${settings.contact.whatsapp}`}
          label={settings.chrome.whatsappLabel}
        />,
      ),
      'whatsapp-wrapper',
    );
  });

  test('lightbox renders exactly the legacy markup', () => {
    // React deliberately drops an empty-string <img src> (it would make the
    // browser re-download the page; legacy JS sets the src on open anyway).
    // Every other byte must match, so compare with only that attribute removed.
    expect(normalizeHtml(renderToStaticMarkup(<Lightbox />))).toBe(
      normalizeHtml(legacyOuterHtml('lightbox')).replace(' src=""', ''),
    );
  });

  test('gallery modal renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<GalleryModal />), 'galleryModal');
  });

  test('material bubble renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<MaterialBubble />), 'materialBubble');
  });

  test('premium modal renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<PremiumModal />), 'premiumModal');
  });
});
