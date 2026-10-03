import { z } from 'zod';
// Starts empty: the section is still rendered from legacy HTML. The conversion task defines the real fields.
export const schema = z.object({}).strict();
export type Fields = z.infer<typeof schema>;
