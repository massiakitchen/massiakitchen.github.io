import settingsContent from '@/content/settings.json';
import { settingsSchema } from '@/lib/content/settings';
import { Header, SkipLink, ThemeToggle } from './Header';
import { Footer, WhatsappButton } from './Footer';
import { GalleryModal, Lightbox, MaterialBubble, PremiumModal, Preloader, SvgGradients } from './Overlays';

const settings = settingsSchema.parse(settingsContent);

// Everything before <main>, in legacy order: SVG gradient defs, skip link,
// preloader, header, theme toggle.
export function Before() {
  return (
    <>
      <SvgGradients />
      <SkipLink href={settings.chrome.skipLink.href} label={settings.chrome.skipLink.label} />
      <Preloader />
      <Header settings={settings} />
      <ThemeToggle label={settings.chrome.themeToggleLabel} />
    </>
  );
}

// Everything after <main>, in legacy order:
// footer, WhatsApp button, lightbox, gallery modal, material bubble, premium modal.
export function After() {
  return (
    <>
      <Footer settings={settings} />
      <WhatsappButton
        href={`https://wa.me/${settings.contact.whatsapp}`}
        label={settings.chrome.whatsappLabel}
      />
      <Lightbox />
      <GalleryModal />
      <MaterialBubble />
      <PremiumModal />
    </>
  );
}
