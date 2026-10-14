import { z } from "zod";
import { MAX_URL_LENGTH } from "./limits.js";

export const PREVIEW_FETCH_TIMEOUT_MS = 10_000;
export const PREVIEW_WORKER_TIMEOUT_MS = 12_000;
export const PREVIEW_HIGHLIGHT_WAIT_MS = 3000;
export const PREVIEW_NEGATIVE_VERDICT_MS = 2500;
export const PREVIEW_MAX_HTML_BYTES = 5_000_000;

export const PREVIEW_VIEWPORT_SIZES = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 320, height: 640 },
} as const;

export const PREVIEW_UNAVAILABLE_REASONS = [
  "http-error",
  "not-html",
  "too-large",
  "timeout",
  "network-error",
  "blocked-address",
] as const;

export const PreviewUnavailableReasonSchema = z.enum(
  PREVIEW_UNAVAILABLE_REASONS,
);
export type PreviewUnavailableReason = z.infer<
  typeof PreviewUnavailableReasonSchema
>;

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

function isHttpUrl(value: string): boolean {
  return URL.canParse(value) && HTTP_PROTOCOLS.has(new URL(value).protocol);
}

export const PreviewFetchRequestSchema = z.object({
  pageUrl: z
    .string()
    .max(MAX_URL_LENGTH)
    .refine(isHttpUrl, "Must be an http(s) URL."),
});
export type PreviewFetchRequest = z.infer<typeof PreviewFetchRequestSchema>;

export const PreviewFetchResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("loaded"),
    finalUrl: z.string(),
    html: z.string(),
  }),
  z.object({
    kind: z.literal("unavailable"),
    reason: PreviewUnavailableReasonSchema,
    httpStatus: z.number().int().nullable(),
  }),
]);
export type PreviewFetchResult = z.infer<typeof PreviewFetchResultSchema>;
