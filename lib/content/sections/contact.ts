import { z } from 'zod';

const quickActionSchema = z
  .object({
    id: z.string(),
    href: z.string(),
    icon: z.string(),
    title: z.string(),
    subtitle: z.string(),
    dir: z.string().optional(),
    subtitleDir: z.string().optional(),
    target: z.string().optional(),
    rel: z.string().optional(),
  })
  .strict();

const infoItemSchema = z
  .object({
    icon: z.string(),
    label: z.string(),
    value: z.string(),
    href: z.string().optional(),
  })
  .strict();

const socialItemSchema = z
  .object({
    id: z.string(),
    href: z.string(),
    icon: z.string(),
    name: z.string(),
    target: z.string().optional(),
    rel: z.string().optional(),
  })
  .strict();

const textFieldSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    placeholder: z.string(),
    icon: z.string(),
  })
  .strict();

const optionSchema = z.object({ value: z.string(), label: z.string() }).strict();

const selectFieldSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    icon: z.string(),
    placeholder: z.string(),
    options: z.array(optionSchema),
  })
  .strict();

const formSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    name: textFieldSchema,
    phone: textFieldSchema,
    city: selectFieldSchema,
    service: selectFieldSchema,
    message: textFieldSchema,
    attachment: z
      .object({
        inputId: z.string(),
        label: z.string(),
        buttonText: z.string(),
        icon: z.string(),
        note: z.string(),
      })
      .strict(),
    terms: z
      .object({
        agreeText: z.string(),
        termsHref: z.string(),
        termsLabel: z.string(),
        separator: z.string(),
        privacyHref: z.string(),
        privacyLabel: z.string(),
      })
      .strict(),
    submitLabel: z.string(),
    submittingLabel: z.string(),
    resetLabel: z.string(),
    privacyNote: z.string(),
    responseTime: z.string(),
  })
  .strict();

export const schema = z
  .object({
    title: z.string(),
    subtitle: z.string(),
    quickActions: z.array(quickActionSchema),
    info: z.array(infoItemSchema),
    socialsTitle: z.string(),
    socials: z.array(socialItemSchema),
    form: formSchema,
  })
  .strict();

export type Fields = z.infer<typeof schema>;
