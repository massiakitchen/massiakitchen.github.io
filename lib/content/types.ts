export const SECTION_IDS = [
  'scrollytelling', 'materials', 'calculator', 'why-us', 'works', 'facebook-slider', 'branches', 'reviews', 'faq', 'contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
