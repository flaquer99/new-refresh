import Fastify, {
  type FastifyBaseLogger,
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { createAuthHook } from "./auth-hook.js";
import { handleError } from "./error-handler.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerScanRoutes } from "./routes/scans.js";
import type { ServerDeps } from "./server-deps.js";

export type CreateAppInput = {
  logger?: FastifyServerOptions["logger"];
  loggerInstance?: FastifyBaseLogger;
};

export const createApp = ({
  logger,
  loggerInstance,
}: CreateAppInput): FastifyInstance => {
  const app = Fastify(loggerInstance ? { loggerInstance } : { logger });
  app.setErrorHandler(handleError);
  return app;
};

export const mountRoutes = (app: FastifyInstance, deps: ServerDeps) => {
  registerHealthRoute(app, deps);
  app.register((scoped, _options, done) => {
    scoped.addHook("onRequest", createAuthHook(deps.token));
    registerScanRoutes(scoped, deps);
    done();
  });
};
