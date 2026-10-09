import { BLOCKED_ADDRESS } from "../network/egress-policy.js";

const HTTP_ERROR_MIN_STATUS = 400;
const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

export type PageSkipReason = "not-html";
export type PageFailReason =
  | "http-error"
  | "timeout"
  | "network-error"
  | "blocked-address";

export type LoadRejection =
  | { kind: "skipped"; reason: PageSkipReason; httpStatus: number | null }
  | {
      kind: "failed";
      reason: PageFailReason;
      httpStatus: number | null;
      refusedUrl?: string;
    };

export type ResponseClass =
  | { kind: "html"; httpStatus: number }
  | LoadRejection;

export type ResponseFacts = {
  status: number;
  contentType: string | null;
  egressVerdict?: string | null;
};

export const failed = (
  reason: PageFailReason,
  httpStatus: number | null = null,
): LoadRejection => ({ kind: "failed", reason, httpStatus });

const isHtml = (contentType: string | null): boolean => {
  const mediaType = contentType?.split(";")[0]?.trim().toLowerCase() ?? "";
  return HTML_CONTENT_TYPES.includes(mediaType);
};

export const classifyResponse = ({
  status,
  contentType,
  egressVerdict,
}: ResponseFacts): ResponseClass => {
  if (egressVerdict) {
    return failed(
      egressVerdict === BLOCKED_ADDRESS ? "blocked-address" : "network-error",
    );
  }
  if (status >= HTTP_ERROR_MIN_STATUS) {
    return failed("http-error", status);
  }
  if (!isHtml(contentType)) {
    return { kind: "skipped", reason: "not-html", httpStatus: status };
  }
  return { kind: "html", httpStatus: status };
};
