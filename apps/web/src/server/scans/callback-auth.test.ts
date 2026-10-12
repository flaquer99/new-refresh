import { describe, expect, it, vi } from "vitest";
import { isAuthorizedCallback } from "./callback-auth";

const VALID_TOKEN = "c".repeat(32);
const SHORT_TOKEN = "c".repeat(31);

const bearer = (token: string): Headers =>
	new Headers({ authorization: `Bearer ${token}` });

describe("isAuthorizedCallback", () => {
	it("accepts the configured callback token", () => {
		// GIVEN
		vi.stubEnv("SCAN_CALLBACK_TOKEN", VALID_TOKEN);

		// WHEN
		const authorized = isAuthorizedCallback(bearer(VALID_TOKEN));

		// THEN
		expect(authorized).toBe(true);
	});

	it("rejects a different token", () => {
		// GIVEN
		vi.stubEnv("SCAN_CALLBACK_TOKEN", VALID_TOKEN);

		// WHEN
		const authorized = isAuthorizedCallback(bearer("d".repeat(32)));

		// THEN
		expect(authorized).toBe(false);
	});

	it("rejects every callback when the configured token is shorter than 32 characters", () => {
		// GIVEN
		vi.stubEnv("SCAN_CALLBACK_TOKEN", SHORT_TOKEN);

		// WHEN
		const authorized = isAuthorizedCallback(bearer(SHORT_TOKEN));

		// THEN
		expect(authorized).toBe(false);
	});
});
