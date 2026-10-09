import { fireEvent, render, screen } from "@testing-library/react";
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

const FORM_HEADING = "Scan a website";
const COMPLETED = buildStatus({ status: "completed", report: buildReport() });
const UNREACHABLE = buildStatus({
	status: "failed",
	error: { code: "SITE_UNREACHABLE", message: "We couldn't reach the site." },
});

installFakeTimersPerTest();

describe("ScanPage focus", () => {
	it("leaves focus alone when the form first appears", () => {
		// GIVEN / WHEN
		render(<ScanPage />);

		// THEN
		expect(document.activeElement).toBe(document.body);
	});

	it("moves focus to the form heading after going back from an error", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: UNREACHABLE }]);
		await submitScan();
		await advancePoll();

		// WHEN
		fireEvent.click(screen.getByRole("button", { name: "Back to form" }));

		// THEN
		expect(document.activeElement).toBe(
			screen.getByRole("heading", { name: FORM_HEADING }),
		);
	});

	it("moves focus to the form heading after confirming a new scan", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: COMPLETED }]);
		await submitScan();
		await advancePoll();
		fireEvent.click(screen.getByRole("button", { name: "New scan" }));

		// WHEN
		fireEvent.click(screen.getByRole("button", { name: "Start a new scan" }));

		// THEN
		expect(document.activeElement).toBe(
			screen.getByRole("heading", { name: FORM_HEADING }),
		);
	});
});
