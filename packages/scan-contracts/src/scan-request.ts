import { z } from "zod";
import { MAX_DEPTH, MAX_URL_LENGTH, MIN_DEPTH } from "./limits.js";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export const INVALID_URL_MESSAGE =
  "Enter a full web address that starts with http:// or https://.";

export const INVALID_DEPTH_MESSAGE = `Depth must be a whole number from ${MIN_DEPTH} to ${MAX_DEPTH}.`;

const isHttpUrl = (value: string): boolean => {
  if (!URL.canParse(value)) {
    return false;
  }
  return ALLOWED_PROTOCOLS.has(new URL(value).protocol);
};

export const ScanUrlSchema = z
  .string()
  .trim()
  .max(MAX_URL_LENGTH, INVALID_URL_MESSAGE)
  .refine(isHttpUrl, INVALID_URL_MESSAGE);

export const ScanDepthSchema = z
  .number(INVALID_DEPTH_MESSAGE)
  .int(INVALID_DEPTH_MESSAGE)
  .min(MIN_DEPTH, INVALID_DEPTH_MESSAGE)
  .max(MAX_DEPTH, INVALID_DEPTH_MESSAGE);

export const ScanRequestSchema = z.object({
  url: ScanUrlSchema,
  depth: ScanDepthSchema,
});

export type ScanRequest = z.infer<typeof ScanRequestSchema>;

export const CreateScanResponseSchema = z.object({
  scanId: z.string().min(1),
});

export type CreateScanResponse = z.infer<typeof CreateScanResponseSchema>;
