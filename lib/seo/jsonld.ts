import type { Fields as FaqFields } from '@/lib/content/sections/faq';
import type { Settings } from '@/lib/content/settings';

// Structured data for <head>, generated from site content. The objects must stay
// deep-equal to the legacy application/ld+json blocks (see tests/unit/seo.test.ts).
// Values with no editable settings field yet (geo, hours, ratings, catalog) are kept
// here as legacy-identical literals; Phase 3 can promote them into settings.

export function localBusinessJsonLd(settings: Settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.companyName,
    image: [
      `${settings.seo.url}images/kitchen1.webp`,
      `${settings.seo.url}images/logo-dark.png`,
    ],
    description:
      'تصميم وتنفيذ مطابخ الألومنيوم والخشب عالية الجودة - ضمان 10 سنوات - تركيب مجاني - تقسيط ميسر',
    url: settings.seo.url,
    telephone: settings.contact.phoneHref.replace(/^tel:/, ''),
    email: settings.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.contact.address,
      addressLocality: 'المنصورة',
      addressRegion: 'الدقهلية',
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '31.03537',
      longitude: '31.3900721',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '21:00',
    },
    priceRange: '$$',
    sameAs: [settings.contact.facebook],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '247',
    },
    areaServed: 'Egypt',
  };
}

export function serviceJsonLd(settings: Settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'تصميم وتنفيذ مطابخ',
    provider: {
      '@type': 'LocalBusiness',
      name: settings.companyName,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Egypt',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات الماسية للمطابخ',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'مطابخ ألومنيوم' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'مطابخ خشب' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'دريسينج روم' },
        },
      ],
    },
  };
}

export function faqJsonLd(faq: FaqFields) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.split('\n')[0],
      },
    })),
  };
}
