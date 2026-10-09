const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;

export type StoppableWorker = {
  stop: () => Promise<void>;
  log: {
    info: (details: { event: string; signal: string }, message: string) => void;
    error: (details: { event: string; err: unknown }, message: string) => void;
  };
};

export type SignalSource = {
  once: (signal: string, listener: (signal: string) => void) => unknown;
};

export const stopOnSignals = (
  { stop, log }: StoppableWorker,
  signals: SignalSource = process,
) => {
  let stopping = false;
  const handle = async (signal: string) => {
    log.info({ event: "worker.stopping", signal }, "worker.stopping");
    if (stopping) {
      return;
    }
    stopping = true;
    try {
      await stop();
    } catch (err) {
      log.error({ event: "worker.stop_failed", err }, "worker.stop_failed");
    }
  };
  for (const signal of SHUTDOWN_SIGNALS) {
    signals.once(signal, () => handle(signal));
  }
};
