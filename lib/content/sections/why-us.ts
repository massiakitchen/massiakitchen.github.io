import { z } from 'zod';

const cardSchema = z.object({ icon: z.string(), title: z.string(), text: z.string() }).strict();

export const schema = z
  .object({
    title: z.string(),
    subtitle: z.string(),
    cards: z.array(cardSchema),
    rating: z
      .object({
        stars: z.number(),
        score: z.string(),
        reviewsText: z.string(),
        recommendText: z.string(),
      })
      .strict(),
    booking: z
      .object({
        title: z.string(),
        nameLabel: z.string(),
        nameInputId: z.string(),
        phoneLabel: z.string(),
        phoneInputId: z.string(),
        submitLabel: z.string(),
        note: z.string(),
      })
      .strict(),
  })
  .strict();

export type Fields = z.infer<typeof schema>;
