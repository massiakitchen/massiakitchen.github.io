import { z } from 'zod';

// Page chrome (header, footer, overlays) settings. Task 9 extends this with `seo`.
const linkSchema = z.object({ label: z.string(), href: z.string() }).strict();

const logoSchema = z
  .object({ webp: z.string(), png: z.string(), alt: z.string() })
  .strict();

export const settingsSchema = z
  .object({
    companyName: z.string(),
    brand: z
      .object({
        title: z.string(),
        tagline: z.string(),
        logoLight: logoSchema,
        logoDark: logoSchema,
      })
      .strict(),
    nav: z
      .object({
        main: z.array(linkSchema),
        mobile: z.array(linkSchema),
      })
      .strict(),
    contact: z
      .object({
        phoneDisplay: z.string(),
        phoneHref: z.string(),
        whatsapp: z.string(),
        email: z.string(),
        facebook: z.string(),
        address: z.string(),
        hours: z.string(),
        warranty: z.string(),
      })
      .strict(),
    footer: z
      .object({
        aboutText: z.string(),
        quickLinksTitle: z.string(),
        quickLinks: z.array(linkSchema),
        servicesTitle: z.string(),
        services: z.array(linkSchema),
        contactTitle: z.string(),
        copyright: z.string(),
        developerText: z.string(),
        creditName: z.string(),
        creditHref: z.string(),
        legal: z.array(linkSchema),
      })
      .strict(),
    chrome: z
      .object({
        skipLink: linkSchema,
        themeToggleLabel: z.string(),
        whatsappLabel: z.string(),
      })
      .strict(),
  })
  .strict();

export type Settings = z.infer<typeof settingsSchema>;
