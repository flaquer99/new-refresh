import { SCAN_INTERRUPTED_MESSAGE } from "@refresh/scan-contracts/errors";
import { describe, expect, it, vi } from "vitest";
import { MAX_TRANSIENT_POLL_RETRIES } from "@/lib/scans/schedule-polling";
import { stubFetchQueue } from "@/testing/fetch-queue";
import { renderLiveScan } from "@/testing/live-scan-hook";
import {
	advancePolls,
	installFakeTimersPerTest,
	WORKER_DOWN,
} from "@/testing/polling";
import { buildStatus } from "@/testing/report-fixtures";
import { mockRouter } from "@/testing/router";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const OUTAGE_POLLS = MAX_TRANSIENT_POLL_RETRIES + 3;
const PROGRESS = { pagesScanned: 7, pagesDiscovered: 60, currentUrl: null };
const RUNNING = { body: buildStatus({ progress: PROGRESS }) };
const INTERRUPTED = {
	body: buildStatus({
		status: "failed",
		error: { code: "SCAN_INTERRUPTED", message: SCAN_INTERRUPTED_MESSAGE },
	}),
};

const outageThen = (response: { body: unknown }) => [
	...Array.from({ length: OUTAGE_POLLS }, () => WORKER_DOWN),
	response,
];

installFakeTimersPerTest();

describe("useLiveScan after losing the scanner", () => {
	it("shows the interrupted scan once the restarted scanner answers, without a manual check", async () => {
		// GIVEN
		const router = mockRouter();
		stubFetchQueue(outageThen(INTERRUPTED));
		renderLiveScan();

		// WHEN
		await advancePolls(OUTAGE_POLLS + 1);

		// THEN
		expect(router.refresh).toHaveBeenCalledTimes(1);
	});

	it("clears the lost-contact notice when the scanner reports progress again", async () => {
		// GIVEN
		mockRouter();
		stubFetchQueue(outageThen(RUNNING));
		const { result } = renderLiveScan();

		// WHEN
		await advancePolls(OUTAGE_POLLS + 1);

		// THEN
		expect(result.current.pollError).toBeNull();
	});

	it("shows the progress reported after the scanner comes back", async () => {
		// GIVEN
		mockRouter();
		stubFetchQueue(outageThen(RUNNING));
		const { result } = renderLiveScan();

		// WHEN
		await advancePolls(OUTAGE_POLLS + 1);

		// THEN
		expect(result.current.progress).toEqual(PROGRESS);
	});
});
