import {
  PREVIEW_MAX_HTML_BYTES,
  type PreviewFetchResult,
} from "@refresh/scan-contracts/preview";
import type { Response } from "undici";
import { EGRESS_VERDICT_HEADER } from "../network/egress-policy.js";
import {
  classifyPreviewResponse,
  unavailable,
} from "./classify-preview-response.js";
import { decodeHtml } from "./decode-html.js";
import { readCappedBytes } from "./read-capped-bytes.js";

export type PreviewOutcome = { result: PreviewFetchResult; bytes: number };

const readLoaded = async (
  response: Response,
  contentType: string | null,
): Promise<PreviewOutcome> => {
  const { bytes, truncated } = await readCappedBytes(
    response,
    PREVIEW_MAX_HTML_BYTES,
  );
  if (truncated) {
    const result = unavailable("too-large", response.status);
    return { result, bytes: bytes.byteLength };
  }
  const html = decodeHtml(bytes, contentType);
  const result = { kind: "loaded" as const, finalUrl: response.url, html };
  return { result, bytes: bytes.byteLength };
};

export const settlePreviewResponse = (
  response: Response,
): Promise<PreviewOutcome> | PreviewOutcome => {
  const contentType = response.headers.get("content-type");
  const rejection = classifyPreviewResponse({
    status: response.status,
    contentType,
    contentLength: response.headers.get("content-length"),
    egressVerdict: response.headers.get(EGRESS_VERDICT_HEADER),
  });
  if (rejection) {
    return { result: rejection, bytes: 0 };
  }
  return readLoaded(response, contentType);
};
