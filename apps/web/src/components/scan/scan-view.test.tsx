import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockRouter } from "@/testing/router";
import { buildStoredScan } from "@/testing/stored-scans";
import { ScanView } from "./scan-view";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

describe("ScanView", () => {
	it("shows live progress for a running scan", () => {
		// GIVEN
		mockRouter();

		// WHEN
		render(
			<ScanView scan={buildStoredScan({ status: "running", report: null })} />,
		);

		// THEN
		expect(
			screen.getByRole("heading", { name: "Scan in progress" }),
		).not.toBeNull();
	});

	it("shows the stored report of a finished scan", () => {
		// WHEN
		render(<ScanView scan={buildStoredScan()} />);

		// THEN
		expect(
			screen.getByRole("heading", {
				name: "Report for https://www.example.org/",
			}),
		).not.toBeNull();
	});

	it("shows the failure of a scan without a report", () => {
		// WHEN
		render(
			<ScanView
				scan={buildStoredScan({
					status: "failed",
					report: null,
					error: { code: "SITE_UNREACHABLE", message: "Unreachable." },
				})}
			/>,
		);

		// THEN
		expect(screen.getByText("Unreachable.")).not.toBeNull();
	});

	it("explains a finished scan that has neither report nor error", () => {
		// WHEN
		render(
			<ScanView
				scan={buildStoredScan({ status: "cancelled", report: null })}
			/>,
		);

		// THEN
		expect(
			screen.getByText("The scan ended without a result. Run it again."),
		).not.toBeNull();
	});
});
