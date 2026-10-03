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

const badgeSchema = z.object({ icon: z.string(), text: z.string() }).strict();

export const schema = z.object({
  welcome: z.string(),
  title: z.string(),
  badges: z.array(badgeSchema),
  footTrust: z.array(badgeSchema),
  cta: z.object({ href: z.string(), text: z.string() }).strict(),
  parallax: z.array(z.object({ cls: z.string(), speed: z.string(), media: mediaSchema }).strict()),
}).strict();

export type Fields = z.infer<typeof schema>;
