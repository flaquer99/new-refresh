import { describe, expect, it, vi } from "vitest";
import {
	STUB_WORKER_TOKEN,
	STUB_WORKER_URL,
	stubWorker,
} from "@/testing/stub-worker";
import { forwardToWorker } from "./worker-client";

describe("forwardToWorker", () => {
	it("sends the bearer token and client id to the worker path", async () => {
		// GIVEN
		const calls = stubWorker(200, {});

		// WHEN
		await forwardToWorker({
			method: "GET",
			path: "/scans/abc",
			clientId: "203.0.113.7",
		});

		// THEN
		expect(calls).toEqual([
			{
				url: `${STUB_WORKER_URL}/scans/abc`,
				method: "GET",
				headers: {
					authorization: `Bearer ${STUB_WORKER_TOKEN}`,
					"x-client-id": "203.0.113.7",
				},
				body: null,
			},
		]);
	});

	it("sends the request body as JSON", async () => {
		// GIVEN
		const calls = stubWorker(201, {});
		const body = { url: "https://www.example.org/", depth: 1 };

		// WHEN
		await forwardToWorker({
			method: "POST",
			path: "/scans",
			clientId: "c",
			body,
		});

		// THEN
		expect({
			contentType: calls[0]?.headers["content-type"],
			body: calls[0]?.body,
		}).toEqual({
			contentType: "application/json",
			body,
		});
	});

	it("defaults the worker URL to the local worker port", async () => {
		// GIVEN
		const calls = stubWorker(200, {});
		vi.stubEnv("SCAN_WORKER_URL", undefined);

		// WHEN
		await forwardToWorker({ method: "GET", path: "/scans/abc", clientId: "c" });

		// THEN
		expect(calls[0]?.url).toBe("http://127.0.0.1:3001/scans/abc");
	});
});
