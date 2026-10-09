import type { HttpScanErrorCode } from "@refresh/scan-contracts/errors";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { TargetNotAllowedError } from "../network/target-not-allowed-error.js";
import { ScanLimitError } from "../scans/scan-limit-errors.js";
import { ApiError, sendError } from "./api-error.js";
import { clientIdHash, readClientId } from "./client-id.js";

const HTTP_CLIENT_ERROR_MIN = 400;
const HTTP_SERVER_ERROR_MIN = 500;
const INVALID_REQUEST_MESSAGE = "The request is not valid.";
const INTERNAL_ERROR_MESSAGE =
  "Something went wrong on our side. Try again later.";

const LIMIT_EVENTS = {
  SCAN_ALREADY_RUNNING: "scan.conflict",
  CAPACITY_REACHED: "capacity.rejected",
} as const;

type Envelope = { code: HttpScanErrorCode; message: string };

const isClientError = (error: FastifyError): boolean =>
  (error.statusCode ?? HTTP_SERVER_ERROR_MIN) >= HTTP_CLIENT_ERROR_MIN &&
  (error.statusCode ?? HTTP_SERVER_ERROR_MIN) < HTTP_SERVER_ERROR_MIN;

const logLimit = (request: FastifyRequest, error: ScanLimitError) => {
  const event = LIMIT_EVENTS[error.code];
  const hash = clientIdHash(readClientId(request));
  request.log.warn({ event, clientIdHash: hash }, event);
};

const knownEnvelope = (error: FastifyError): Envelope | null => {
  if (error instanceof ApiError || error instanceof ScanLimitError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof TargetNotAllowedError) {
    return { code: "URL_NOT_ALLOWED", message: error.message };
  }
  if (isClientError(error)) {
    return { code: "INVALID_REQUEST", message: INVALID_REQUEST_MESSAGE };
  }
  return null;
};

export const handleError = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof ScanLimitError) {
    logLimit(request, error);
  }
  const envelope = knownEnvelope(error);
  if (envelope) {
    return sendError(reply, envelope);
  }
  request.log.error({ err: error }, "request.failed");
  return sendError(reply, {
    code: "INTERNAL_ERROR",
    message: INTERNAL_ERROR_MESSAGE,
  });
};
