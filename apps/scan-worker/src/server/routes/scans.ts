import { WorkerScanRequestSchema } from "@refresh/scan-contracts/scan-request";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { ApiError } from "../api-error.js";
import { clientIdHash, readClientId } from "../client-id.js";
import type { ServerDeps } from "../server-deps.js";

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_ACCEPTED = 202;
const SCAN_NOT_FOUND_MESSAGE = "This scan no longer exists. Start a new scan.";

type ScanParams = { Params: { id: string } };

const parseScanRequest = (body: unknown) => {
  const parsed = WorkerScanRequestSchema.safeParse(body);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    throw new ApiError("INVALID_REQUEST", issue?.message ?? "Invalid request.");
  }
  return parsed.data;
};

const createScan = async (deps: ServerDeps, request: FastifyRequest) => {
  const { scanId, url, depth } = parseScanRequest(request.body);
  await deps.validateTarget(url);
  const clientId = readClientId(request);
  deps.registry.create({ scanId, request: { url, depth }, clientId });
  request.log.info(
    {
      event: "scan.started",
      scanId,
      origin: new URL(url).origin,
      depth,
      clientIdHash: clientIdHash(clientId),
    },
    "scan.started",
  );
  return { scanId };
};

const foundOrThrow = (status: ScanStatus | undefined): ScanStatus => {
  if (!status) {
    throw new ApiError("SCAN_NOT_FOUND", SCAN_NOT_FOUND_MESSAGE);
  }
  return status;
};

export const registerScanRoutes = (app: FastifyInstance, deps: ServerDeps) => {
  app.post("/scans", async (request, reply) => {
    const created = await createScan(deps, request);
    return reply.code(HTTP_CREATED).send(created);
  });
  app.get<ScanParams>("/scans/:id", (request, reply) => {
    const status = foundOrThrow(deps.registry.get(request.params.id));
    return reply.header("cache-control", "no-store").send(status);
  });
  app.delete<ScanParams>("/scans/:id", (request, reply) => {
    const status = foundOrThrow(deps.registry.cancel(request.params.id));
    const code = status.status === "running" ? HTTP_ACCEPTED : HTTP_OK;
    return reply.code(code).send(status);
  });
};
