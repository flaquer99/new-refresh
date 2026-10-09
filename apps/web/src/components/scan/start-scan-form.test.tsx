import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { stubFetchQueue } from "@/testing/fetch-queue";
import { START_URL } from "@/testing/finding-fixtures";
import { DEPTH_LABEL, URL_LABEL } from "@/testing/render-scan-form";
import { mockRouter } from "@/testing/router";
import { StartScanForm } from "./start-scan-form";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
const CONFLICT = {
	code: "SCAN_ALREADY_RUNNING",
	message:
		"A scan is already running for you. Wait for it to finish or cancel it.",
};

const submitUrl = async () => {
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(URL_LABEL), START_URL);
	await user.click(screen.getByRole("button", { name: "Scan" }));
};

describe("StartScanForm", () => {
	it("prefills the form with the scan to run again", () => {
		// GIVEN
		mockRouter();

		// WHEN
		render(<StartScanForm initialRequest={{ url: START_URL, depth: 2 }} />);

		// THEN
		expect([
			(screen.getByLabelText(URL_LABEL) as HTMLInputElement).value,
			(screen.getByLabelText(DEPTH_LABEL) as HTMLSelectElement).value,
		]).toEqual([START_URL, "2"]);
	});

	it("goes to the new scan's link once the scan starts", async () => {
		// GIVEN
		const router = mockRouter();
		stubFetchQueue([{ body: { scanId: SCAN_ID }, status: 201 }]);
		render(<StartScanForm initialRequest={null} />);

		// WHEN
		await submitUrl();

		// THEN
		expect(router.push).toHaveBeenCalledWith(`/scans/${SCAN_ID}`);
	});

	it("shows the start error inline and stays on the form", async () => {
		// GIVEN
		const router = mockRouter();
		stubFetchQueue([{ body: { error: CONFLICT }, status: 409 }]);
		render(<StartScanForm initialRequest={null} />);

		// WHEN
		await submitUrl();

		// THEN
		expect([
			screen.getByRole("alert").textContent,
			router.push.mock.calls,
		]).toEqual([CONFLICT.message, []]);
	});
});
