import { z } from "zod";
import { PreviewUnavailableReasonSchema } from "./preview.js";

export const HIGHLIGHT_OUTCOMES = [
  "highlighted",
  "not-found",
  "hidden",
  "unsupported-selector",
] as const;

export const HighlightOutcomeSchema = z.enum(HIGHLIGHT_OUTCOMES);
export type HighlightOutcome = z.infer<typeof HighlightOutcomeSchema>;

export const PREVIEW_MESSAGE_SOURCE = "refresh-preview";

export const FindingPreviewSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("loaded"),
    pageUrl: z.string(),
    finalUrl: z.string(),
    document: z.string(),
    token: z.string(),
  }),
  z.object({
    kind: z.literal("unavailable"),
    pageUrl: z.string(),
    reason: PreviewUnavailableReasonSchema,
    httpStatus: z.number().int().nullable(),
  }),
]);
export type FindingPreview = z.infer<typeof FindingPreviewSchema>;

export const PreviewHighlightMessageSchema = z.object({
  source: z.literal(PREVIEW_MESSAGE_SOURCE),
  token: z.string(),
  outcome: HighlightOutcomeSchema,
  matchCount: z.number().int().nonnegative(),
});
export type PreviewHighlightMessage = z.infer<
  typeof PreviewHighlightMessageSchema
>;
