import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { stubFetchQueue } from "@/testing/fetch-queue";
import { START_URL } from "@/testing/finding-fixtures";
import {
	advancePoll,
	CREATED,
	installFakeTimersPerTest,
} from "@/testing/polling";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { submitScan } from "@/testing/submit-scan";

const URL_LABEL = "Website address";
const COMPLETED = buildStatus({ status: "completed", report: buildReport() });
const UNREACHABLE = buildStatus({
	status: "failed",
	error: { code: "SITE_UNREACHABLE", message: "We couldn't reach the site." },
});
const REJECTED = {
	body: { error: { code: "URL_NOT_ALLOWED", message: "Private address." } },
	status: 422,
};

const urlValue = (): string =>
	screen.getByLabelText<HTMLInputElement>(URL_LABEL).value;

installFakeTimersPerTest();

describe("ScanPage return to form", () => {
	it("keeps the submitted URL when going back after a failed scan", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: UNREACHABLE }]);
		await submitScan();
		await advancePoll();

		// WHEN
		fireEvent.click(screen.getByRole("button", { name: "Back to form" }));

		// THEN
		expect(urlValue()).toBe(START_URL);
	});

	it("keeps the submitted URL when going back after a rejected request", async () => {
		// GIVEN
		stubFetchQueue([REJECTED]);
		await submitScan();

		// WHEN
		fireEvent.click(screen.getByRole("button", { name: "Back to form" }));

		// THEN
		expect(urlValue()).toBe(START_URL);
	});

	it("clears the form after confirming a new scan from the report", async () => {
		// GIVEN
		stubFetchQueue([CREATED, { body: COMPLETED }]);
		await submitScan();
		await advancePoll();
		fireEvent.click(screen.getByRole("button", { name: "New scan" }));

		// WHEN
		fireEvent.click(screen.getByRole("button", { name: "Start a new scan" }));

		// THEN
		expect(urlValue()).toBe("");
	});
});
