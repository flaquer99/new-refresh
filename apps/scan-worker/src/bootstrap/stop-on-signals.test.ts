import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { createRecordingFastifyLogger } from "../testing/fastify-logger.js";
import { stopOnSignals } from "./stop-on-signals.js";

const setup = (stop = vi.fn(() => Promise.resolve())) => {
  const signals = new EventEmitter();
  const log = createRecordingFastifyLogger();
  stopOnSignals({ stop, log }, signals);
  return { signals, log, stop };
};

describe("stopOnSignals", () => {
  it.each(["SIGINT", "SIGTERM"])("stops the worker on %s", (signal) => {
    // GIVEN
    const { signals, stop } = setup();

    // WHEN
    signals.emit(signal);

    // THEN
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("stops only once when both signals arrive", () => {
    // GIVEN
    const { signals, stop } = setup();

    // WHEN
    signals.emit("SIGTERM");
    signals.emit("SIGINT");

    // THEN
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("logs the shutdown signal", () => {
    // GIVEN
    const { signals, log } = setup();

    // WHEN
    signals.emit("SIGTERM");

    // THEN
    expect(log.info).toHaveBeenCalledWith(
      { event: "worker.stopping", signal: "SIGTERM" },
      "worker.stopping",
    );
  });

  it("logs a failed shutdown instead of crashing", async () => {
    // GIVEN
    const failure = new Error("guard already closed");
    const { signals, log } = setup(vi.fn(() => Promise.reject(failure)));

    // WHEN
    signals.emit("SIGINT");
    await vi.waitFor(() => expect(log.error).toHaveBeenCalled());

    // THEN
    expect(log.error).toHaveBeenCalledWith(
      { event: "worker.stop_failed", err: failure },
      "worker.stop_failed",
    );
  });
});
