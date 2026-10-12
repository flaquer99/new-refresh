import {
  type FixtureServer,
  serveFixtures,
} from "@refresh/a11y-fixtures/serve-fixtures";
import { type RunningWorker, startWorker } from "../bootstrap/start-worker.js";
import { type CallbackServer, startCallbackServer } from "./callback-server.js";
import { createRecordingFastifyLogger } from "./fastify-logger.js";
import { workerConfig } from "./integration-worker.js";

export type IntegrationWorker = {
  fixtures: FixtureServer;
  callbacks: CallbackServer;
  worker: RunningWorker;
  stop: () => Promise<void>;
  close: () => Promise<void>;
};

const once = (work: () => Promise<void>) => {
  let running: Promise<void> | undefined;
  return () => {
    running ??= work();
    return running;
  };
};

const startOrClose = async (
  fixtures: FixtureServer,
  callbacks: CallbackServer,
): Promise<RunningWorker> => {
  try {
    return await startWorker({
      config: workerConfig(fixtures.origin, callbacks.url),
      loggerInstance: createRecordingFastifyLogger(),
    });
  } catch (error) {
    await callbacks.close();
    await fixtures.close();
    throw error;
  }
};

export const bootIntegrationWorker = async (): Promise<IntegrationWorker> => {
  const fixtures = await serveFixtures({ port: 0 });
  const callbacks = await startCallbackServer();
  const worker = await startOrClose(fixtures, callbacks);
  const stop = once(worker.stop);
  const close = async () => {
    await stop();
    await callbacks.close();
    await fixtures.close();
  };
  return { fixtures, callbacks, worker, stop, close };
};
