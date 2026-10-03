import { z } from 'zod';

const reviewSchema = z.object({
  text: z.string(),
  name: z.string(),
  meta: z.string(),
  date: z.string(),
  initials: z.string(),
  active: z.boolean(),
}).strict();

const statSchema = z.object({
  value: z.string(),
  label: z.string(),
}).strict();

export const schema = z.object({
  title: z.string(),
  description: z.string(),
  ratingStars: z.number(),
  ratingLabel: z.string(),
  prevLabel: z.string(),
  nextLabel: z.string(),
  indicatorLabel: z.string(),
  items: z.array(reviewSchema),
  stats: z.array(statSchema),
  cta: z.object({
    title: z.string(),
    text: z.string(),
    primaryHref: z.string(),
    primaryLabel: z.string(),
    secondaryHref: z.string(),
    secondaryLabel: z.string(),
  }).strict(),
}).strict();

export type Fields = z.infer<typeof schema>;
