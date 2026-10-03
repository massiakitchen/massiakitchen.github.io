import { z } from 'zod';

const iconTextSchema = z.object({
  icon: z.string(),
  text: z.string(),
}).strict();

const titledTextSchema = z.object({
  title: z.string(),
  text: z.string(),
}).strict();

const categorySchema = z.object({
  id: z.string(),
  label: z.string(),
  active: z.boolean(),
}).strict();

const statSchema = z.object({
  value: z.string(),
  label: z.string(),
}).strict();

const itemSchema = z.object({
  category: z.string(),
  icon: z.string(),
  question: z.string(),
  answer: z.string(),
  controls: z.string().optional(),
  answerId: z.string().optional(),
  // Exactly one of these is non-empty per item; each renders its legacy container.
  details: z.array(iconTextSchema),
  badges: z.array(z.string()),
  materials: z.array(titledTextSchema),
  warranty: z.array(iconTextSchema),
  payments: z.array(titledTextSchema),
  tags: z.array(z.string()),
}).strict();

export const schema = z.object({
  title: z.string(),
  description: z.string(),
  searchLabel: z.string(),
  searchPlaceholder: z.string(),
  categories: z.array(categorySchema),
  stats: z.array(statSchema),
  items: z.array(itemSchema),
  cta: z.object({
    title: z.string(),
    text: z.string(),
    phoneHref: z.string(),
    phoneLabel: z.string(),
    whatsappHref: z.string(),
    whatsappLabel: z.string(),
  }).strict(),
}).strict();

export type Fields = z.infer<typeof schema>;
