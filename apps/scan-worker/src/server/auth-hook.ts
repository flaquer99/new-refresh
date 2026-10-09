import { createHash, timingSafeEqual } from "node:crypto";
import type { onRequestAsyncHookHandler } from "fastify";
import { sendError } from "./api-error.js";

const BEARER_PREFIX = "Bearer ";
const UNAUTHORIZED_MESSAGE = "Missing or invalid token.";

const digest = (value: string): Buffer =>
  createHash("sha256").update(value).digest();

const bearerToken = (header: string | undefined): string =>
  header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : "";

export const createAuthHook = (token: string): onRequestAsyncHookHandler => {
  const expected = digest(token);
  return async (request, reply) => {
    const presented = digest(bearerToken(request.headers.authorization));
    if (timingSafeEqual(presented, expected)) {
      return;
    }
    return sendError(reply, {
      code: "UNAUTHORIZED",
      message: UNAUTHORIZED_MESSAGE,
    });
  };
};
