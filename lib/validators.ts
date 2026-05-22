import { z } from "zod";

export const LineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

export const OptionalAddonSchema = z.object({
  id: z.string(),
  description: z.string(),
  unitPrice: z.number().min(0),
});

export const CreateQuoteSchema = z.object({
  contactId: z.string(),
  opportunityId: z.string().optional(),
  locationId: z.string(),
  businessName: z.string(),
  businessLogo: z.string().optional(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  quoteTitle: z.string(),
  quoteDate: z.string(),
  expiryDate: z.string(),
  lineItems: z.array(LineItemSchema),
  optionalAddons: z.array(OptionalAddonSchema).default([]),
  taxRate: z.number().min(0).max(100).default(0),
  depositPercent: z.number().min(0).max(100).default(0),
  terms: z.string().default(""),
});

export const ApproveQuoteSchema = z.object({
  token: z.string(),
  signature: z.string(),
  selectedAddons: z.array(z.string()).default([]),
});
