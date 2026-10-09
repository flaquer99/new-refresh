import type { FastifyBaseLogger, FastifyInstance } from "fastify";
import { launchGuardedBrowser } from "../browser/launch-browser.js";
import type { WorkerConfig } from "../config.js";
import { startEgressGuard } from "../network/egress-guard.js";
import { resolveHost } from "../network/resolve-host.js";
import { createApp, mountRoutes } from "../server/build-server.js";
import { loggerOptions } from "../server/logger-options.js";
import {
  serverDeps,
  startServices,
  stopServices,
  type WorkerRuntime,
  type WorkerServices,
} from "./worker-services.js";

const DEFAULT_RUNTIME: WorkerRuntime = {
  startGuard: startEgressGuard,
  launchBrowser: launchGuardedBrowser,
  resolve: resolveHost,
};

export type StartWorkerInput = {
  config: WorkerConfig;
  runtime?: WorkerRuntime;
  loggerInstance?: FastifyBaseLogger;
};

export type RunningWorker = {
  app: FastifyInstance;
  address: string;
  stop: () => Promise<void>;
};

const listenOrStop = async (
  app: FastifyInstance,
  config: WorkerConfig,
  services: WorkerServices,
): Promise<string> => {
  try {
    return await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    await stopServices(services);
    throw error;
  }
};

export const startWorker = async ({
  config,
  runtime = DEFAULT_RUNTIME,
  loggerInstance,
}: StartWorkerInput): Promise<RunningWorker> => {
  const logger = loggerOptions(config.logLevel);
  const app = createApp({ logger, loggerInstance });
  const services = await startServices({ app, config, runtime });
  mountRoutes(app, serverDeps({ config, runtime }, services));
  const address = await listenOrStop(app, config, services);
  const stop = async () => {
    await app.close();
    await stopServices(services);
  };
  return { app, address, stop };
};
