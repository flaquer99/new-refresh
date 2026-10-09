import { describe, expect, it } from "vitest";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { stateFromStatus } from "./scan-state";

describe("stateFromStatus", () => {
	it("keeps a running scan running with its progress", () => {
		// GIVEN
		const status = buildStatus();

		// WHEN
		const state = stateFromStatus(status);

		// THEN
		expect(state).toEqual({
			phase: "running",
			scanId: "scan-1",
			progress: status.progress,
		});
	});

	it("finishes a completed scan with its report", () => {
		// GIVEN
		const report = buildReport();

		// WHEN
		const state = stateFromStatus(buildStatus({ status: "completed", report }));

		// THEN
		expect(state).toEqual({ phase: "finished", report });
	});

	it("finishes a cancelled scan with its partial report", () => {
		// GIVEN
		const report = buildReport({ outcome: "cancelled" });

		// WHEN
		const state = stateFromStatus(buildStatus({ status: "cancelled", report }));

		// THEN
		expect(state).toEqual({ phase: "finished", report });
	});

	it("fails a failed scan with its error", () => {
		// GIVEN
		const error = {
			code: "SITE_UNREACHABLE",
			message: "We couldn't reach the site.",
		} as const;

		// WHEN
		const state = stateFromStatus(buildStatus({ status: "failed", error }));

		// THEN
		expect(state).toEqual({ phase: "failed", error });
	});

	it("fails a terminal scan that carries neither a report nor an error", () => {
		// GIVEN
		const status = buildStatus({ status: "completed" });

		// WHEN
		const state = stateFromStatus(status);

		// THEN
		expect(state).toMatchObject({
			phase: "failed",
			error: { code: "INTERNAL_ERROR" },
		});
	});
});
