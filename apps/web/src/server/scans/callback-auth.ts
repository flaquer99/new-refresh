import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { readCallbackToken } from "./callback-config";

const BEARER_PREFIX = "Bearer ";
const DIGEST_ALGORITHM = "sha256";

const digest = (value: string): Buffer =>
	createHash(DIGEST_ALGORITHM).update(value).digest();

const presentedToken = (headers: Headers): string => {
	const header = headers.get("authorization") ?? "";
	return header.startsWith(BEARER_PREFIX)
		? header.slice(BEARER_PREFIX.length)
		: "";
};

export const isAuthorizedCallback = (headers: Headers): boolean => {
	const expected = readCallbackToken();
	if (!expected) {
		return false;
	}
	return timingSafeEqual(digest(presentedToken(headers)), digest(expected));
};
