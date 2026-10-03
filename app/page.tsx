import type { ComponentType } from 'react';
import { After, Before } from '@/components/site/Chrome';
import Scrollytelling from '@/components/sections/Scrollytelling';
import Materials from '@/components/sections/Materials';
import Calculator from '@/components/sections/Calculator';
import WhyUs from '@/components/sections/WhyUs';
import Works from '@/components/sections/Works';
import FacebookSlider from '@/components/sections/FacebookSlider';
import Branches from '@/components/sections/Branches';
import Reviews from '@/components/sections/Reviews';
import Faq from '@/components/sections/Faq';
import Contact from '@/components/sections/Contact';
import { loadSite } from '@/lib/content/load';
import type { SectionId } from '@/lib/content/types';

const COMPONENTS: Record<SectionId, ComponentType<{ fields: any }>> = {
  scrollytelling: Scrollytelling, materials: Materials, calculator: Calculator, 'why-us': WhyUs, works: Works,
  'facebook-slider': FacebookSlider, branches: Branches, reviews: Reviews, faq: Faq, contact: Contact,
};

export default function HomePage() {
  const site = loadSite();
  return (
    <>
      <Before />
      <main id="main">
        {site.sections.filter((s) => s.visible).map((s) => {
          const Section = COMPONENTS[s.id];
          return <Section key={s.id} fields={s.fields} />;
        })}
      </main>
      <After />
    </>
  );
}
