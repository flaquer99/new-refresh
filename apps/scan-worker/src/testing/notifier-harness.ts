import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import { vi } from "vitest";
import { createResultNotifier } from "../callback/result-notifier.js";

export const NOTIFIER_SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
export const NOTIFIER_TOKEN = "c".repeat(32);

export const FAILED_RESULT: ScanResult = {
  scanId: NOTIFIER_SCAN_ID,
  status: "failed",
  report: null,
  error: { code: "SITE_UNREACHABLE", message: "Unreachable." },
  finishedAt: "2026-10-09T10:05:00.000Z",
};

type CallbackFetch = (url: string, init?: RequestInit) => Promise<Response>;

export const stubCallbackFetch = (respond: CallbackFetch) => {
  const fetchMock = vi.fn(respond);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

export const failingCallbackFetch = () =>
  stubCallbackFetch(() => Promise.reject(new TypeError("fetch failed")));

const failAfter = (ms: number, signal: AbortSignal | null | undefined) =>
  new Promise<Response>((_resolve, reject) => {
    const timer = setTimeout(() => reject(new TypeError("fetch failed")), ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

export const slowFailingCallbackFetch = (ms: number) =>
  stubCallbackFetch((_url, init) => failAfter(ms, init?.signal));

const CALLBACK_URL = "http://127.0.0.1:3000/api/internal/scans";

type NewNotifierInput = { signal?: AbortSignal; url?: string };

export const newNotifier = ({
  signal,
  url = CALLBACK_URL,
}: NewNotifierInput = {}) => {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const notifier = createResultNotifier({
    url,
    token: NOTIFIER_TOKEN,
    logger,
    signal,
  });
  return { notifier, logger };
};
