import { errors } from "playwright";
import { failed, type LoadRejection } from "./classify-response.js";

const DOWNLOAD_STARTED = /Download is starting/;
const CHROMIUM_NETWORK_ERROR = /net::ERR_/;
const PROXY_TUNNEL_REFUSED = /net::ERR_TUNNEL_CONNECTION_FAILED/;

export const isTunnelRefusal = (error: unknown): boolean =>
  error instanceof Error && PROXY_TUNNEL_REFUSED.test(error.message);

export const classifyNavigationError = (error: unknown): LoadRejection => {
  if (!(error instanceof Error)) {
    throw new Error(`Navigation failed: ${String(error)}`);
  }
  if (error instanceof errors.TimeoutError) {
    return failed("timeout");
  }
  if (DOWNLOAD_STARTED.test(error.message)) {
    return { kind: "skipped", reason: "not-html", httpStatus: null };
  }
  if (CHROMIUM_NETWORK_ERROR.test(error.message)) {
    return failed("network-error");
  }
  throw error;
};
