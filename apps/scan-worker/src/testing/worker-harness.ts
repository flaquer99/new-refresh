import { vi } from "vitest";
import { startWorker } from "../bootstrap/start-worker.js";
import type { WorkerRuntime } from "../bootstrap/worker-services.js";
import type { WorkerConfig } from "../config.js";
import { fakeLauncher } from "./fake-browser.js";
import { createRecordingFastifyLogger } from "./fastify-logger.js";
import { stubResolver } from "./stub-resolver.js";

export const BOOT_TOKEN = "k".repeat(32);

const CONFIG: WorkerConfig = {
  host: "127.0.0.1",
  port: 0,
  token: BOOT_TOKEN,
  egressAllowlist: new Set(),
  logLevel: "info",
};

export const fakeRuntime = () => {
  const launcher = fakeLauncher();
  const guard = {
    url: "http://127.0.0.1:9",
    close: vi.fn(() => Promise.resolve()),
  };
  const runtime: WorkerRuntime = {
    startGuard: vi.fn(() => Promise.resolve(guard)),
    launchBrowser: launcher.launch as unknown as WorkerRuntime["launchBrowser"],
    resolve: stubResolver(),
  };
  return { runtime, guard, ...launcher };
};

export const startFakeWorker = (
  runtime: WorkerRuntime,
  port: number = CONFIG.port,
) =>
  startWorker({
    config: { ...CONFIG, port },
    loggerInstance: createRecordingFastifyLogger(),
    runtime,
  });

export const bootWorker = async () => {
  const { runtime, ...fakes } = fakeRuntime();
  const worker = await startFakeWorker(runtime);
  return { worker, ...fakes };
};
