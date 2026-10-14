import type { Response } from "undici";
import { Response as UndiciResponse } from "undici";
import { vi } from "vitest";
import type { TargetPolicy } from "../audit/settle-refusal.js";
import type { GuardedFetch } from "../network/guarded-fetch.js";
import type { FetchPreviewPageInput } from "../preview/fetch-preview-page.js";
import { stubResolver } from "./stub-resolver.js";

export const PREVIEW_TEST_URL = "http://example.test/page";
export const PREVIEW_TEST_USER_AGENT = "TestChromium RefreshA11yScanner/1.0";
const PUBLIC_ADDRESS = "93.184.216.34";

export type StubResponseInit = {
  status?: number;
  headers?: Record<string, string>;
  url?: string;
};

export const stubResponse = (
  body: string | Uint8Array | null,
  { status = 200, headers = {}, url = PREVIEW_TEST_URL }: StubResponseInit = {},
): Response => {
  const response = new UndiciResponse(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });
  Object.defineProperty(response, "url", { value: url });
  return response;
};

export const publicPolicy = (): TargetPolicy => ({
  resolve: stubResolver({ "example.test": [PUBLIC_ADDRESS] }),
  allowlist: new Set<string>(),
});

export const previewInput = (
  fetch: GuardedFetch,
  overrides: Partial<FetchPreviewPageInput> = {},
): FetchPreviewPageInput => ({
  url: PREVIEW_TEST_URL,
  fetch,
  policy: publicPolicy(),
  userAgent: PREVIEW_TEST_USER_AGENT,
  logger: { info: vi.fn() },
  ...overrides,
});
