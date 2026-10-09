import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildHistoryEntry, HISTORY_NOW } from "@/testing/history-fixtures";
import { ScanHistoryEntry } from "./scan-history-entry";

vi.mock("@/app/scans/actions", () => ({ deleteScanAction: vi.fn() }));

const DELETE_NAME = "Delete scan of https://www.example.org/";

const renderEntry = (overrides = {}) =>
	render(
		<ScanHistoryEntry entry={buildHistoryEntry(overrides)} now={HISTORY_NOW} />,
	);

describe("ScanHistoryEntry", () => {
	it("links the start url to the scan link", () => {
		// WHEN
		renderEntry();

		// THEN
		expect(
			screen
				.getByRole("link", { name: "https://www.example.org/" })
				.getAttribute("href"),
		).toBe("/scans/8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11");
	});

	it("shows the status and the violation counts as text", () => {
		// WHEN
		renderEntry();

		// THEN
		const text = screen.getByRole("article").textContent;
		expect([
			text?.includes("Completed"),
			text?.includes("2 critical"),
			text?.includes("11 serious"),
		]).toEqual([true, true, true]);
	});

	it("shows when the scan started relative to now with the exact time", () => {
		// WHEN
		renderEntry();

		// THEN
		const time = screen.getByText("5 minutes ago");
		expect([time.getAttribute("dateTime"), time.textContent]).toEqual([
			"2026-10-09T11:55:00.000Z",
			"5 minutes ago (Oct 9, 2026, 11:55 AM UTC)",
		]);
	});

	it("badges a scan that stopped at the page limit as partial", () => {
		// WHEN
		renderEntry({ outcome: "page-limit-reached" });

		// THEN
		expect(screen.getByText("Limited — page limit reached")).not.toBeNull();
	});

	it("shows the failure reason instead of counts for a failed scan", () => {
		// WHEN
		renderEntry({
			status: "failed",
			outcome: null,
			error: {
				code: "SITE_UNREACHABLE",
				message: "We couldn't reach the site.",
			},
		});

		// THEN
		expect(screen.getByText("We couldn't reach the site.")).not.toBeNull();
	});

	it("offers a Delete action named after the start url", () => {
		// WHEN
		renderEntry();

		// THEN
		expect(screen.getByRole("button", { name: DELETE_NAME })).not.toBeNull();
	});

	it("offers no Delete action for a running scan", () => {
		// WHEN
		renderEntry({ status: "running", outcome: null, deletable: false });

		// THEN
		expect(screen.queryByRole("button", { name: DELETE_NAME })).toBeNull();
	});
});
