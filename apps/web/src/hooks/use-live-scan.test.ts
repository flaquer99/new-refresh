import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { stubFetchQueue } from "@/testing/fetch-queue";
import { renderLiveScan } from "@/testing/live-scan-hook";
import { advancePoll, installFakeTimersPerTest } from "@/testing/polling";
import { buildReport, buildStatus } from "@/testing/report-fixtures";
import { mockRouter } from "@/testing/router";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const PROGRESS = { pagesScanned: 2, pagesDiscovered: 5, currentUrl: null };
const RUNNING = { body: buildStatus({ progress: PROGRESS }) };
const COMPLETED = {
	body: buildStatus({ status: "completed", report: buildReport() }),
};

installFakeTimersPerTest();

describe("useLiveScan", () => {
	it("shows the progress reported by the latest poll", async () => {
		// GIVEN
		mockRouter();
		stubFetchQueue([RUNNING]);
		const { result } = renderLiveScan();

		// WHEN
		await advancePoll();

		// THEN
		expect(result.current.progress).toEqual(PROGRESS);
	});

	it("refreshes the page when a poll returns a finished scan", async () => {
		// GIVEN
		const router = mockRouter();
		stubFetchQueue([COMPLETED]);
		renderLiveScan();

		// WHEN
		await advancePoll();

		// THEN
		expect(router.refresh).toHaveBeenCalledTimes(1);
	});

	it("does not refresh while the scan is still running", async () => {
		// GIVEN
		const router = mockRouter();
		stubFetchQueue([RUNNING]);
		renderLiveScan();

		// WHEN
		await advancePoll();

		// THEN
		expect(router.refresh).not.toHaveBeenCalled();
	});

	it("applies the status returned by a cancel request", async () => {
		// GIVEN
		const router = mockRouter();
		stubFetchQueue([COMPLETED]);
		const { result } = renderLiveScan();

		// WHEN
		await act(async () => {
			await result.current.cancel();
		});

		// THEN
		expect(router.refresh).toHaveBeenCalledTimes(1);
	});
});
