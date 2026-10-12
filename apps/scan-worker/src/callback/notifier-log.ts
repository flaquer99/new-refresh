import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import type { Attempt } from "./post-result.js";

type LogDetails = Record<string, unknown> & { event: string; scanId: string };

type LogFn = (details: LogDetails, message: string) => void;

export type NotifierLogger = { info: LogFn; warn: LogFn; error: LogFn };

export type FinalOutcome = "delivered" | "rejected" | "exhausted";

export type FinalDelivery = {
  logger: NotifierLogger;
  result: ScanResult;
  outcome: FinalOutcome;
  attempts: number;
};

export type RetryLog = {
  logger: NotifierLogger;
  scanId: string;
  attempt: number;
  sent: Attempt;
};

const attemptDetails = ({ httpStatus, errorName }: Attempt) => ({
  ...(httpStatus === undefined ? {} : { httpStatus }),
  ...(errorName === undefined ? {} : { errorName }),
});

export const logFinal = ({
  logger,
  result,
  outcome,
  attempts,
}: FinalDelivery) => {
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

export const logRetry = ({ logger, scanId, attempt, sent }: RetryLog) => {
  const details = {
    event: "scan.result_retry",
    scanId,
    attempt,
    ...attemptDetails(sent),
  };
  logger.warn(details, "scan.result_retry");
};
