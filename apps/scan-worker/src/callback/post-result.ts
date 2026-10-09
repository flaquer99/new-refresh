import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import { ATTEMPT_TIMEOUT_MS } from "./retry-delays.js";

const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 299;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const TRAILING_SLASH = /\/+$/;

export type AttemptOutcome = "delivered" | "rejected" | "retry";

export type Attempt = {
  outcome: AttemptOutcome;
  httpStatus?: number;
  errorName?: string;
};

export type CallbackTarget = { url: string; token: string };

const classify = (status: number): AttemptOutcome => {
  if (status >= HTTP_OK_MIN && status <= HTTP_OK_MAX) {
    return "delivered";
  }
  if (status === HTTP_NOT_FOUND) {
    return "delivered";
  }
  if (status === HTTP_BAD_REQUEST || status === HTTP_UNAUTHORIZED) {
    return "rejected";
  }
  return "retry";
};

export const resultUrl = (baseUrl: string, scanId: string): string =>
  `${baseUrl.replace(TRAILING_SLASH, "")}/${encodeURIComponent(scanId)}/result`;

export const postResult = async (
  { url, token }: CallbackTarget,
  result: ScanResult,
): Promise<Attempt> => {
  try {
    const response = await fetch(resultUrl(url, result.scanId), {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(result),
      signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
    });
    await response.body?.cancel();
    return { outcome: classify(response.status), httpStatus: response.status };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "Error";
    return { outcome: "retry", errorName };
  }
};
