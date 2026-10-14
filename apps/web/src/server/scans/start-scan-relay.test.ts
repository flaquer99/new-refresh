import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFakeScanStore } from "@/testing/fake-scan-store";
import { MEMBER_ACTOR } from "@/testing/scan-actors";
import { SCAN_ID, VALID_SCAN_BODY } from "@/testing/scan-route-requests";
import { spyOnServerLog } from "@/testing/server-log-spy";
import { stubWorker } from "@/testing/stub-worker";
import { startScan } from "./start-scan";

vi.mock("@/server/auth/resolve-starter-name", () => ({
	resolveStarterName: vi.fn(() => Promise.resolve("Ana Souza")),
}));
vi.mock("@/server/db/scan-store", () => ({ getScanStore: vi.fn() }));

const START = { request: VALID_SCAN_BODY, actor: MEMBER_ACTOR };

describe("startScan worker rejection", () => {
	const store = useFakeScanStore();

	beforeEach(() => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(SCAN_ID);
		spyOnServerLog();
	});

	it.each([
		[409, "SCAN_ALREADY_RUNNING"],
		[422, "URL_NOT_ALLOWED"],
		[502, "WORKER_UNAVAILABLE"],
		[503, "CAPACITY_REACHED"],
	] as const)(
		"discards the row when the worker answers %d",
		async (status, code) => {
			// GIVEN
			stubWorker(status, { error: { code, message: "From the worker." } });

			// WHEN
			await startScan(START);

			// THEN
			expect(store().discard).toHaveBeenCalledWith(SCAN_ID);
		},
	);

	it("relays the worker's rejection unchanged", async () => {
		// GIVEN
		const workerBody = {
			error: { code: "CAPACITY_REACHED", message: "Busy." },
		};
		stubWorker(503, workerBody);

		// WHEN
		const response = await startScan(START);

		// THEN
		expect({ status: response.status, body: await response.json() }).toEqual({
			status: 503,
			body: workerBody,
		});
	});
});
