import { describe, expect, it } from "vitest";
import { resolveClientId } from "./client-id";

describe("resolveClientId", () => {
	it("picks the first forwarded IP", () => {
		// GIVEN
		const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });

		// WHEN
		const clientId = resolveClientId(headers);

		// THEN
		expect(clientId).toBe("203.0.113.7");
	});

	it("falls back to x-real-ip when no forwarded IP is present", () => {
		// GIVEN
		const headers = new Headers({ "x-real-ip": "198.51.100.4" });

		// WHEN
		const clientId = resolveClientId(headers);

		// THEN
		expect(clientId).toBe("198.51.100.4");
	});

	it("falls back to anonymous when no client IP header is present", () => {
		// GIVEN
		const headers = new Headers();

		// WHEN
		const clientId = resolveClientId(headers);

		// THEN
		expect(clientId).toBe("anonymous");
	});

	it("ignores blank client IP headers", () => {
		// GIVEN
		const headers = new Headers({
			"x-forwarded-for": " , 10.0.0.1",
			"x-real-ip": " ",
		});

		// WHEN
		const clientId = resolveClientId(headers);

		// THEN
		expect(clientId).toBe("anonymous");
	});
});
