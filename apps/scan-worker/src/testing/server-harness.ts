import type { FastifyBaseLogger } from "fastify";
import { afterEach, beforeEach, vi } from "vitest";
import { validateTarget } from "../network/validate-target.js";
import { createScanRegistry } from "../scans/scan-registry.js";
import { createApp, mountRoutes } from "../server/build-server.js";
import { createControlledRunner } from "./controlled-runner.js";
import { stubResolver } from "./stub-resolver.js";

export const WORKER_TOKEN = "w".repeat(40);
export const AUTH_HEADERS = { authorization: `Bearer ${WORKER_TOKEN}` };
export const PUBLIC_URL = "https://www.example.org/";
export const SERVER_SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";

const RESOLVER = stubResolver({ "www.example.org": ["93.184.215.14"] });

export type TestServerOptions = {
  browserConnected?: boolean;
  loggerInstance?: FastifyBaseLogger;
  validate?: (url: string) => Promise<void>;
};

const validatePublicTarget = (url: string) =>
  validateTarget({ url, resolve: RESOLVER, allowlist: new Set() });

export const startTestServer = ({
  browserConnected = true,
  loggerInstance,
  validate = validatePublicTarget,
}: TestServerOptions = {}) => {
  const controlled = createControlledRunner();
  const app = createApp({ loggerInstance });
  mountRoutes(app, {
    registry: createScanRegistry({
      runner: controlled.runner,
      logger: app.log,
    }),
    validateTarget: validate,
    token: WORKER_TOKEN,
    browserConnected: () => browserConnected,
  });
  return { app, controlled };
};

type TestApp = ReturnType<typeof startTestServer>["app"];

export const postScan = (app: TestApp, clientId = "alice") =>
  app.inject({
    method: "POST",
    url: "/scans",
    headers: { ...AUTH_HEADERS, "x-client-id": clientId },
    payload: { url: PUBLIC_URL, depth: 1 },
  });

export const scanRequest = (
  app: TestApp,
  method: "GET" | "DELETE",
  scanId = SERVER_SCAN_ID,
) => app.inject({ method, url: `/scans/${scanId}`, headers: AUTH_HEADERS });

export const useServerTestClock = () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.spyOn(crypto, "randomUUID").mockReturnValue(SERVER_SCAN_ID);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
};
