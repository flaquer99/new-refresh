import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import { vi } from "vitest";
import type { WorkerServices } from "../bootstrap/worker-services.js";
import type {
  NotifyOutcome,
  ResultNotifier,
} from "../callback/result-notifier.js";
import { createScanRegistry } from "../scans/scan-registry.js";
import { createControlledRunner } from "./controlled-runner.js";
import { REGISTRY_REQUEST } from "./registry-harness.js";
import { scanIdFor } from "./scan-ids.js";

export type NotifierFactory = (signal: AbortSignal) => ResultNotifier;

const closable = () => vi.fn(() => Promise.resolve());

export const shutdownServices = (createNotifier: NotifierFactory) => {
  const deliveries = new AbortController();
  const controlled = createControlledRunner();
  const notifier = createNotifier(deliveries.signal);
  const registry = createScanRegistry({ runner: controlled.runner, notifier });
  const browser = {
    current: vi.fn(),
    isConnected: () => true,
    close: closable(),
  };
  const fetchClient = { fetch: vi.fn(), close: closable() };
  const guard = { url: "http://127.0.0.1:9", close: closable() };
  const services: WorkerServices = {
    guard,
    browser,
    fetchClient,
    registry,
    deliveries,
  };
  return { services, registry, controlled, browser };
};

export const startShutdownScan = (
  registry: ReturnType<typeof createScanRegistry>,
  index = 1,
) =>
  registry.create({
    scanId: scanIdFor(index),
    request: REGISTRY_REQUEST,
    clientId: `client-${index}`,
  });

export const pendingNotifier = () => {
  let settle: (outcome: NotifyOutcome) => void = () => undefined;
  const notify = vi.fn(
    (_result: ScanResult) =>
      new Promise<NotifyOutcome>((resolve) => {
        settle = resolve;
      }),
  );
  return { notifier: { notify }, notify, settle: () => settle("delivered") };
};
