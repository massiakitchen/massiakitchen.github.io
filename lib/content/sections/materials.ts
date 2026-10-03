import { z } from 'zod';

const sourceSchema = z.object({
  srcset: z.string(),
  sizes: z.string().optional(),
  type: z.string().optional(),
}).strict();

const imgSchema = z.object({
  loading: z.string(),
  fetchpriority: z.string().optional(),
  decoding: z.string(),
  src: z.string(),
  srcset: z.string().optional(),
  sizes: z.string().optional(),
  alt: z.string(),
  width: z.string(),
  height: z.string(),
}).strict();

const mediaSchema = z.union([
  z.object({ kind: z.literal('picture'), source: sourceSchema, img: imgSchema }).strict(),
  z.object({ kind: z.literal('img'), img: imgSchema }).strict(),
]);

const tabSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().nullable(),
  active: z.boolean(),
}).strict();

const offerSchema = z.object({
  title: z.string(),
  discount: z.string(),
  desc: z.string(),
}).strict();

const materialItemSchema = z.object({
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  media: mediaSchema,
  title: z.string(),
  badgeText: z.string(),
  badgeTone: z.string(),
}).strict();

const categorySchema = z.object({
  tabId: z.string(),
  title: z.string(),
  badgeIcon: z.string(),
  badgeText: z.string(),
  items: z.array(materialItemSchema),
}).strict();

export const schema = z.object({
  title: z.string(),
  tabs: z.array(tabSchema),
  offersHeader: z.object({ title: z.string(), badgeIcon: z.string(), badgeText: z.string() }).strict(),
  offers: z.array(offerSchema),
  categories: z.array(categorySchema),
  clickHint: z.object({ icon: z.string(), text: z.string() }).strict(),
}).strict();

export type Fields = z.infer<typeof schema>;
