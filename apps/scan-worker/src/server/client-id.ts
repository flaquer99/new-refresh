import { createHash } from "node:crypto";
import type { FastifyRequest } from "fastify";

const CLIENT_ID_HEADER = "x-client-id";
const ANONYMOUS_CLIENT = "anonymous";
const HASH_PREFIX_LENGTH = 12;

export const readClientId = (request: FastifyRequest): string => {
  const header = request.headers[CLIENT_ID_HEADER];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.trim() || ANONYMOUS_CLIENT;
};

export const clientIdHash = (clientId: string): string =>
  createHash("sha256")
    .update(clientId)
    .digest("hex")
    .slice(0, HASH_PREFIX_LENGTH);
