import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startWorker } from "./bootstrap/start-worker.js";
import { stopOnSignals } from "./bootstrap/stop-on-signals.js";

const TOKEN = "e".repeat(32);
const CALLBACK_TOKEN = "f".repeat(32);
const worker = { stop: vi.fn(), app: { log: { info: vi.fn() } } };

vi.mock("./bootstrap/start-worker.js", () => ({
  startWorker: vi.fn(() => Promise.resolve(worker)),
}));
vi.mock("./bootstrap/stop-on-signals.js", () => ({ stopOnSignals: vi.fn() }));

describe("worker entrypoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("boots the worker with the config read from the environment", async () => {
    // GIVEN
    vi.stubEnv("SCAN_WORKER_TOKEN", TOKEN);
    vi.stubEnv("SCAN_CALLBACK_TOKEN", CALLBACK_TOKEN);
    vi.stubEnv("SCAN_WORKER_PORT", "3077");

    // WHEN
    await import("./index.js");

    // THEN
    expect(vi.mocked(startWorker).mock.lastCall?.[0].config).toMatchObject({
      token: TOKEN,
      port: 3077,
    });
  });

  it("wires shutdown signals to the running worker", async () => {
    // GIVEN
    vi.stubEnv("SCAN_WORKER_TOKEN", TOKEN);
    vi.stubEnv("SCAN_CALLBACK_TOKEN", CALLBACK_TOKEN);

    // WHEN
    await import("./index.js");

    // THEN
    expect(stopOnSignals).toHaveBeenCalledWith({
      stop: worker.stop,
      log: worker.app.log,
    });
  });
});
