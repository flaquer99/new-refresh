import { PreviewFetchRequestSchema } from "@refresh/scan-contracts/preview";
import type { FastifyInstance } from "fastify";
import { ApiError } from "../api-error.js";
import { readClientId } from "../client-id.js";
import type { ServerDeps } from "../server-deps.js";

const parsePreviewRequest = (body: unknown) => {
  const parsed = PreviewFetchRequestSchema.safeParse(body);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    throw new ApiError("INVALID_REQUEST", issue?.message ?? "Invalid request.");
  }
  return parsed.data;
};

export const registerPreviewRoutes = (
  app: FastifyInstance,
  deps: Pick<ServerDeps, "fetchPreview">,
) => {
  app.post("/previews", async (request, reply) => {
    const { pageUrl } = parsePreviewRequest(request.body);
    const result = await deps.fetchPreview(pageUrl, readClientId(request));
    return reply.header("cache-control", "no-store").send(result);
  });
};
