import { describe, expect, it, vi } from "vitest";
import { stubWorker } from "@/testing/stub-worker";
import { forwardToWorker } from "./worker-client";

describe("forwardToWorker relay", () => {
	it("passes the worker status and body through", async () => {
		// GIVEN
		const body = { error: { code: "SCAN_ALREADY_RUNNING", message: "Busy." } };
		stubWorker(409, body);

		// WHEN
		const response = await forwardToWorker({
			method: "GET",
			path: "/scans/abc",
			clientId: "c",
		});

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 409,
			body,
		});
	});

	it("hides a worker 401 behind a generic 500 INTERNAL_ERROR", async () => {
		// GIVEN
		const body = { error: { code: "UNAUTHORIZED", message: "Bad token." } };
		stubWorker(401, body);

		// WHEN
		const response = await forwardToWorker({
			method: "GET",
			path: "/scans/abc",
			clientId: "c",
		});

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 500,
			body: {
				error: {
					code: "INTERNAL_ERROR",
					message: "Something went wrong on our side. Try again later.",
				},
			},
		});
	});

	it("relays an empty worker response without inventing a body or content type", async () => {
		// GIVEN
		stubWorker(200, {});
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
		);

		// WHEN
		const response = await forwardToWorker({
			method: "DELETE",
			path: "/scans/abc",
			clientId: "c",
		});

		// THEN
		expect({
			status: response.status,
			contentType: response.headers.get("content-type"),
			body: await response.text(),
		}).toEqual({ status: 204, contentType: null, body: "" });
	});
});
