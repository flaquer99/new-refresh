import {
  PREVIEW_MAX_HTML_BYTES,
  type PreviewFetchResult,
  type PreviewUnavailableReason,
} from "@refresh/scan-contracts/preview";
import { BLOCKED_ADDRESS } from "../network/egress-policy.js";

const HTTP_ERROR_MIN_STATUS = 400;
const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

export type PreviewUnavailable = Extract<
  PreviewFetchResult,
  { kind: "unavailable" }
>;

export type PreviewResponseFacts = {
  status: number;
  contentType: string | null;
  contentLength: string | null;
  egressVerdict: string | null;
};

export const unavailable = (
  reason: PreviewUnavailableReason,
  httpStatus: number | null = null,
): PreviewUnavailable => ({ kind: "unavailable", reason, httpStatus });

const isHtml = (contentType: string | null): boolean => {
  const mediaType = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  return HTML_CONTENT_TYPES.includes(mediaType);
};

const exceedsCap = (contentLength: string | null): boolean =>
  contentLength !== null && Number(contentLength) > PREVIEW_MAX_HTML_BYTES;

export const classifyPreviewResponse = (
  facts: PreviewResponseFacts,
): PreviewUnavailable | null => {
  if (facts.egressVerdict) {
    const blocked = facts.egressVerdict === BLOCKED_ADDRESS;
    return unavailable(blocked ? "blocked-address" : "network-error");
  }
  if (facts.status >= HTTP_ERROR_MIN_STATUS) {
    return unavailable("http-error", facts.status);
  }
  if (!isHtml(facts.contentType)) {
    return unavailable("not-html", facts.status);
  }
  return exceedsCap(facts.contentLength)
    ? unavailable("too-large", facts.status)
    : null;
};
