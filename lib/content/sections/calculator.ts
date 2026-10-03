import { z } from 'zod';

const materialOptionSchema = z.object({ value: z.string(), label: z.string() }).strict();

const addonSchema = z
  .object({ id: z.string(), value: z.string(), price: z.number(), label: z.string() })
  .strict();

const costRowSchema = z.object({ label: z.string(), valueId: z.string(), value: z.string() }).strict();

const tabSchema = z.object({ id: z.string(), label: z.string(), active: z.boolean() }).strict();

const rangeInputSchema = z
  .object({
    label: z.string(),
    inputId: z.string(),
    min: z.number(),
    max: z.number(),
    defaultValue: z.number(),
    displayId: z.string(),
    display: z.string(),
  })
  .strict();

const pricesSchema = z
  .object({
    base: z.object({ economy: z.number(), standard: z.number(), premium: z.number() }).strict(),
    drawer: z.object({ economy: z.number(), standard: z.number(), premium: z.number() }).strict(),
    addon: z
      .object({ counter: z.number(), led: z.number(), handles: z.number(), drawers: z.number() })
      .strict(),
    appliance: z
      .object({ oven: z.number(), cooktop: z.number(), hood: z.number(), fridge: z.number() })
      .strict(),
    installation: z.number(),
    cabinet: z.object({ wall: z.number(), base: z.number() }).strict(),
  })
  .strict();

export const schema = z
  .object({
    title: z.string(),
    tabs: z.array(tabSchema),
    area: z
      .object({
        tabId: z.string(),
        area: rangeInputSchema,
        materialLabel: z.string(),
        materialSelectId: z.string(),
        materialOptions: z.array(materialOptionSchema),
        drawers: rangeInputSchema,
        addonsLabel: z.string(),
        addons: z.array(addonSchema),
        resultTitle: z.string(),
        estimatedCostId: z.string(),
        estimatedCost: z.string(),
        breakdown: z.array(costRowSchema),
        recommendationPrefix: z.string(),
        recommendedMaterialId: z.string(),
        recommendedMaterial: z.string(),
        recommendationReasonId: z.string(),
        recommendationReason: z.string(),
        ctaLabel: z.string(),
        note: z.string(),
      })
      .strict(),
    dimensions: z
      .object({
        tabId: z.string(),
        lengthLabel: z.string(),
        lengthInputId: z.string(),
        lengthMin: z.number(),
        lengthMax: z.number(),
        lengthDefault: z.number(),
        lengthStep: z.number(),
        widthLabel: z.string(),
        widthInputId: z.string(),
        widthMin: z.number(),
        widthMax: z.number(),
        widthDefault: z.number(),
        widthStep: z.number(),
        materialLabel: z.string(),
        materialSelectId: z.string(),
        materialOptions: z.array(materialOptionSchema),
        wall: rangeInputSchema,
        base: rangeInputSchema,
        resultTitle: z.string(),
        estimatedCostId: z.string(),
        estimatedCost: z.string(),
        breakdown: z.array(costRowSchema),
        ctaLabel: z.string(),
        note: z.string(),
      })
      .strict(),
    prices: pricesSchema,
  })
  .strict();

export type Fields = z.infer<typeof schema>;
