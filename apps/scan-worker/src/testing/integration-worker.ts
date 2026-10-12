import type { RunningWorker } from "../bootstrap/start-worker.js";
import type { WorkerConfig } from "../config.js";
import type { CallbackServer, ReceivedCallback } from "./callback-server.js";

const WORKER_TOKEN = "i".repeat(32);
export const CALLBACK_TOKEN = "j".repeat(32);
const AUTH = { authorization: `Bearer ${WORKER_TOKEN}`, "x-client-id": "it" };

export const workerConfig = (
  fixturesOrigin: string,
  callbackUrl: string,
): WorkerConfig => ({
  host: "127.0.0.1",
  port: 0,
  token: WORKER_TOKEN,
  callbackUrl,
  callbackToken: CALLBACK_TOKEN,
  egressAllowlist: new Set([new URL(fixturesOrigin).host]),
  logLevel: "info",
});

export type WorkerScan = { scanId: string; url: string; depth?: number };

export const postWorkerScan = (
  worker: RunningWorker,
  { scanId, url, depth = 0 }: WorkerScan,
) =>
  worker.app.inject({
    method: "POST",
    url: "/scans",
    headers: AUTH,
    payload: { scanId, url, depth },
  });

export const callbacksFor = (
  callbacks: CallbackServer,
  scanId: string,
): ReceivedCallback[] =>
  callbacks.received.filter(({ result }) => result.scanId === scanId);
