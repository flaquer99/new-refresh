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

describe("ScanHistoryEntry ownership", () => {
	it("offers a Delete action named after the start url", () => {
		// WHEN
		renderEntry();

		// THEN
		expect(screen.queryAllByRole("button", { name: DELETE_NAME })).toHaveLength(
			1,
		);
	});

	it("offers no Delete action for a running scan", () => {
		// WHEN
		renderEntry({ status: "running", outcome: null, canDelete: false });

		// THEN
		expect(screen.queryByRole("button", { name: DELETE_NAME })).toBeNull();
	});

	it("shows who started the scan", () => {
		// WHEN
		renderEntry({ startedByName: "Ana Souza" });

		// THEN
		expect(screen.getByText("Ana Souza")).toBeTruthy();
	});

	it("shows Unknown member when the starter name is missing", () => {
		// WHEN
		renderEntry({ startedByName: null });

		// THEN
		expect(screen.getByText("Unknown member")).toBeTruthy();
	});

	it("hides the Delete action when the viewer cannot manage the scan", () => {
		// WHEN
		renderEntry({ canDelete: false });

		// THEN
		expect(screen.queryByRole("button", { name: DELETE_NAME })).toBeNull();
	});
});
