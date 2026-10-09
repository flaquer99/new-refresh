import { z } from "zod";

export const PAGE_STATUSES = ["scanned", "skipped", "failed"] as const;

export const PAGE_REASONS = [
  "robots-disallowed",
  "not-html",
  "not-reached",
  "http-error",
  "timeout",
  "network-error",
  "blocked-address",
] as const;

export const PageStatusSchema = z.enum(PAGE_STATUSES);
export type PageStatus = z.infer<typeof PageStatusSchema>;

export const PageReasonSchema = z.enum(PAGE_REASONS);
export type PageReason = z.infer<typeof PageReasonSchema>;

export const PageResultSchema = z.object({
  url: z.string(),
  depth: z.number().int().nonnegative(),
  status: PageStatusSchema,
  reason: PageReasonSchema.nullable(),
  httpStatus: z.number().int().nullable(),
});
export type PageResult = z.infer<typeof PageResultSchema>;
