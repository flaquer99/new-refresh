import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import {
  type FinalOutcome,
  logFinal,
  logRetry,
  type NotifierLogger,
} from "./notifier-log.js";
import { type CallbackTarget, postResult } from "./post-result.js";
import { RETRY_DELAYS_MS, waitForRetry } from "./retry-delays.js";

export type NotifyOutcome = FinalOutcome;

export type ResultNotifier = {
  notify: (result: ScanResult) => Promise<NotifyOutcome>;
};

export type ResultNotifierOptions = CallbackTarget & {
  logger: NotifierLogger;
  retryDelaysMs?: readonly number[];
  signal?: AbortSignal;
};

type Delivery = {
  options: ResultNotifierOptions;
  result: ScanResult;
  signal: AbortSignal;
};

const NEVER_ABORTED = new AbortController().signal;

const finish = (
  { options, result }: Delivery,
  outcome: NotifyOutcome,
  attempts: number,
): NotifyOutcome => {
  logFinal({ logger: options.logger, result, outcome, attempts });
  return outcome;
};

const deliver = async (delivery: Delivery): Promise<NotifyOutcome> => {
  const { options, result, signal } = delivery;
  const delays = options.retryDelaysMs ?? RETRY_DELAYS_MS;
  for (let attempt = 1; ; attempt += 1) {
    const sent = await postResult({ ...options, signal }, result);
    if (sent.outcome !== "retry") {
      return finish(delivery, sent.outcome, attempt);
    }
    const delay = delays[attempt - 1];
    if (delay === undefined || signal.aborted) {
      return finish(delivery, "exhausted", attempt);
    }
    const { logger } = options;
    logRetry({ logger, scanId: result.scanId, attempt, sent });
    if (!(await waitForRetry(delay, signal))) {
      return finish(delivery, "exhausted", attempt);
    }
  }
};

export const createResultNotifier = (
  options: ResultNotifierOptions,
): ResultNotifier => ({
  notify: (result) =>
    deliver({ options, result, signal: options.signal ?? NEVER_ABORTED }),
});
