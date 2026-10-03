import { z } from 'zod';

const coverSchema = z.object({
  webp: z.string(),
  src: z.string(),
  alt: z.string(),
  width: z.string(),
  height: z.string(),
  loading: z.string(),
  decoding: z.string(),
}).strict();

const itemSchema = z.object({
  galleryId: z.string(),
  category: z.string(),
  extraClass: z.string(),
  title: z.string(),
  description: z.string(),
  cover: coverSchema,
  images: z.array(z.string()),
  video: z.string().optional(),
  hidden: z.boolean(),
}).strict();

const filterSchema = z.object({
  value: z.string(),
  label: z.string(),
  active: z.boolean(),
}).strict();

export const schema = z.object({
  title: z.string(),
  filters: z.array(filterSchema),
  cardCta: z.string(),
  loadMore: z.object({ label: z.string() }).strict(),
  items: z.array(itemSchema),
}).strict();

export type Fields = z.infer<typeof schema>;
