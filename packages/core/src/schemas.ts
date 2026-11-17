import { z } from "zod";
import { STAGES } from "./stage";

export const StageSchema = z.enum(STAGES);

/** Input from the "add offer" form (web) and, later, the extension. */
export const OfferInputSchema = z.object({
  url: z.url("Enter a valid URL"),
  title: z.string().trim().min(1, "Title is required").max(200),
  company: z.string().trim().min(1, "Company is required").max(200),
  notes: z.string().trim().max(5000).optional(),
});
export type OfferInput = z.infer<typeof OfferInputSchema>;

/** Row as stored in the database (camelCase after mapping). */
export const OfferSchema = OfferInputSchema.extend({
  id: z.uuid(),
  userId: z.uuid(),
  createdAt: z.coerce.date(),
});
export type Offer = z.infer<typeof OfferSchema>;

/** User-set ghost deadline: after this date the application is flagged as quiet. */
export const ApplicationInputSchema = z.object({
  offerId: z.uuid(),
  stage: StageSchema.default("saved"),
  appliedAt: z.coerce.date().optional(),
  followUpAt: z.coerce.date().optional(),
});
export type ApplicationInput = z.infer<typeof ApplicationInputSchema>;

export const ApplicationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  offerId: z.uuid(),
  stage: StageSchema,
  appliedAt: z.coerce.date().nullable(),
  followUpAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Application = z.infer<typeof ApplicationSchema>;

export const StageEventSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  applicationId: z.uuid(),
  fromStage: StageSchema.nullable(),
  toStage: StageSchema,
  createdAt: z.coerce.date(),
});
export type StageEvent = z.infer<typeof StageEventSchema>;
