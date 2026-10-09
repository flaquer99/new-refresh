import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { stubFetchQueue } from "@/testing/fetch-queue";
import {
	advancePoll,
	CREATED,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { submitScan } from "@/testing/submit-scan";
import { ScanPage } from "./scan-page";

const COMPLETED = buildStatus({ status: "completed", report: buildReport() });
const UNREACHABLE = buildStatus({
	status: "failed",
	error: { code: "SITE_UNREACHABLE", message: "We couldn't reach the site." },
});

const dispatchBeforeUnload = (): Event => {
	const event = new Event("beforeunload", { cancelable: true });
	window.dispatchEvent(event);
	return event;
};

installFakeTimersPerTest();

describe("ScanPage outcomes", () => {
	it("warns before leaving once the report is shown", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: COMPLETED }]);
		await submitScan();

		// WHEN
		await advancePoll();

		// THEN
		expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
	});

	it("does not warn before leaving while the form is shown", () => {
		// GIVEN
		render(<ScanPage />);

		// WHEN
		const event = dispatchBeforeUnload();

		// THEN
		expect(event.defaultPrevented).toBe(false);
	});

	it("shows why the scan failed", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: UNREACHABLE }]);
		await submitScan();

		// WHEN
		await advancePoll();

		// THEN
		expect(screen.getByRole("alert").textContent).toBe(
			"We couldn't reach the site.",
		);
	});
});
