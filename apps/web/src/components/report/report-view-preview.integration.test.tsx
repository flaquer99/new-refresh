import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buildViolation } from "@/testing/finding-fixtures";
import {
	dispatchHighlight,
	jsonResponse,
	loadedPreview,
	PREVIEW_SCAN_ID,
} from "@/testing/preview-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { stubFetch } from "@/testing/stub-fetch";
import { ReportView } from "./report-view";

const report = buildReport({
	manualChecks: [],
	reviewItems: [],
	violations: [buildViolation({ id: "a" })],
});

describe("ReportView with a real preview", () => {
	it("opens a preview from a violation card and reaches highlighted", async () => {
		// GIVEN
		stubFetch(jsonResponse(loadedPreview()));
		render(<ReportView report={report} scanId={PREVIEW_SCAN_ID} />);

		// WHEN
		await userEvent.click(screen.getByRole("button", { name: "Show preview" }));
		const frame = (await screen.findByTitle(
			/Live preview of/,
		)) as HTMLIFrameElement;
		act(() => {
			dispatchHighlight({ source: frame.contentWindow });
		});

		// THEN
		const statuses = screen.getAllByRole("status").map((el) => el.textContent);
		expect(statuses).toContain("Element highlighted.");
	});
});
