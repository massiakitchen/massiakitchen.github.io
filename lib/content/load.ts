import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { SECTION_IDS, type SectionId } from './types';
import * as scrollytelling from './sections/scrollytelling';
import * as materials from './sections/materials';
import * as calculator from './sections/calculator';
import * as whyUs from './sections/why-us';
import * as works from './sections/works';
import * as facebookSlider from './sections/facebook-slider';
import * as branches from './sections/branches';
import * as reviews from './sections/reviews';
import * as faq from './sections/faq';
import * as contact from './sections/contact';

export const SECTION_SCHEMAS = {
  scrollytelling: scrollytelling.schema, materials: materials.schema, calculator: calculator.schema,
  'why-us': whyUs.schema, works: works.schema, 'facebook-slider': facebookSlider.schema, branches: branches.schema,
  reviews: reviews.schema, faq: faq.schema, contact: contact.schema,
} satisfies Record<SectionId, z.ZodType>;

const layoutSchema = z.array(z.object({ id: z.enum(SECTION_IDS), visible: z.boolean() }));

const read = (p: string) => JSON.parse(readFileSync(join(process.cwd(), 'content', p), 'utf8'));

export function loadSite() {
  const layout = layoutSchema.parse(read('layout.json'));
  return {
    settings: read('settings.json') as Record<string, unknown>,
    sections: layout.map(({ id, visible }) => ({
      id, visible, fields: SECTION_SCHEMAS[id].parse(read(`sections/${id}.json`)),
    })),
  };
}
