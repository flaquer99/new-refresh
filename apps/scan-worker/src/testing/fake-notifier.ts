import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import { vi } from "vitest";
import type {
  NotifyOutcome,
  ResultNotifier,
} from "../callback/result-notifier.js";

export const fakeNotifier = (outcome: NotifyOutcome = "delivered") => {
  const notify = vi.fn((_result: ScanResult) => Promise.resolve(outcome));
  const notifier: ResultNotifier = { notify };
  return { notifier, notify };
};
