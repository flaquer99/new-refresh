import {
  type HttpScanErrorCode,
  SCAN_ERROR_HTTP_STATUS,
  type ScanError,
} from "@refresh/scan-contracts/errors";
import type { FastifyReply } from "fastify";

export class ApiError extends Error {
  readonly code: HttpScanErrorCode;

  constructor(code: HttpScanErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export const sendError = (
  reply: FastifyReply,
  error: ScanError & { code: HttpScanErrorCode },
) =>
  reply
    .code(SCAN_ERROR_HTTP_STATUS[error.code])
    .send({ error: { code: error.code, message: error.message } });
