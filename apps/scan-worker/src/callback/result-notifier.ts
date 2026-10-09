import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import {
  type Attempt,
  type CallbackTarget,
  postResult,
} from "./post-result.js";
import { RETRY_DELAYS_MS, waitFor } from "./retry-delays.js";

export type NotifyOutcome = "delivered" | "rejected" | "exhausted";

export type ResultNotifier = {
  notify: (result: ScanResult) => Promise<NotifyOutcome>;
};

type LogDetails = Record<string, unknown> & { event: string; scanId: string };

type LogFn = (details: LogDetails, message: string) => void;

export type NotifierLogger = { info: LogFn; warn: LogFn; error: LogFn };

export type ResultNotifierOptions = CallbackTarget & {
  logger: NotifierLogger;
  retryDelaysMs?: readonly number[];
};

const attemptDetails = ({ httpStatus, errorName }: Attempt) => ({
  ...(httpStatus === undefined ? {} : { httpStatus }),
  ...(errorName === undefined ? {} : { errorName }),
});

const logFinal = (
  logger: NotifierLogger,
  result: ScanResult,
  outcome: NotifyOutcome,
  attempts: number,
) => {
  const scanId = result.scanId;
  if (outcome === "delivered") {
    const details = {
      event: "scan.result_delivered",
      scanId,
      status: result.status,
      attempts,
    };
    logger.info(details, "scan.result_delivered");
    return;
  }
  logger.error(
    { event: "scan.result_undelivered", scanId, outcome },
    "scan.result_undelivered",
  );
};

const deliver = async (
  options: ResultNotifierOptions,
  result: ScanResult,
): Promise<NotifyOutcome> => {
  const delays = options.retryDelaysMs ?? RETRY_DELAYS_MS;
  for (let attempt = 1; ; attempt += 1) {
    const sent = await postResult(options, result);
    const delay = delays[attempt - 1];
    if (sent.outcome !== "retry" || delay === undefined) {
      const outcome = sent.outcome === "retry" ? "exhausted" : sent.outcome;
      logFinal(options.logger, result, outcome, attempt);
      return outcome;
    }
    const details = {
      event: "scan.result_retry",
      scanId: result.scanId,
      attempt,
      ...attemptDetails(sent),
    };
    options.logger.warn(details, "scan.result_retry");
    await waitFor(delay);
  }
};

export const createResultNotifier = (
  options: ResultNotifierOptions,
): ResultNotifier => ({
  notify: (result) => deliver(options, result),
});
