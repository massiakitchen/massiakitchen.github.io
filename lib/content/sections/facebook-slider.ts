import { z } from 'zod';

const slideSchema = z.object({
  kind: z.enum(['reel', 'post']),
  src: z.string(),
  title: z.string(),
  width: z.string(),
  height: z.string(),
}).strict();

export const schema = z.object({
  title: z.string(),
  subtitle: z.string(),
  prevLabel: z.string(),
  nextLabel: z.string(),
  facadeLabel: z.string(),
  slides: z.array(slideSchema),
}).strict();

export type Fields = z.infer<typeof schema>;
