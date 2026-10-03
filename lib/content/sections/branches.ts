import { z } from 'zod';

const branchSchema = z.object({
  key: z.string(),
  name: z.string(),
  address: z.string(),
  phones: z.string(),
  hours: z.string(),
  email: z.string(),
  mapToggle: z.string(),
  mapId: z.string(),
  mapSrc: z.string(),
  mapTitle: z.string(),
  externalHref: z.string(),
  externalTitle: z.string(),
  externalLabel: z.string(),
}).strict();

const miniLinkSchema = z.object({
  href: z.string(),
  label: z.string(),
  icon: z.string(),
  dir: z.string().optional(),
  target: z.string().optional(),
  rel: z.string().optional(),
}).strict();

export const schema = z.object({
  title: z.string(),
  items: z.array(branchSchema),
  mini: z.array(miniLinkSchema),
}).strict();

export type Fields = z.infer<typeof schema>;
