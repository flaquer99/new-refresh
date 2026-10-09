import type { FastifyInstance } from "fastify";
import type { ServerDeps } from "../server-deps.js";

const HTTP_OK = 200;
const HTTP_SERVICE_UNAVAILABLE = 503;

export const registerHealthRoute = (
  app: FastifyInstance,
  { registry, browserConnected }: ServerDeps,
) => {
  app.get("/health", (_request, reply) => {
    const connected = browserConnected();
    return reply.code(connected ? HTTP_OK : HTTP_SERVICE_UNAVAILABLE).send({
      status: connected ? "ok" : "degraded",
      activeScans: registry.activeCount(),
      browserConnected: connected,
    });
  });
};
