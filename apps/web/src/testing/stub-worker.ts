import { vi } from "vitest";

export const STUB_WORKER_URL = "http://worker.test:4100";
export const STUB_WORKER_TOKEN = "s".repeat(32);
export const WORKER_TIMEOUT_MS = 10_000;

export type RecordedWorkerCall = {
	url: string;
	method: string;
	headers: Record<string, string>;
	body: unknown;
};

const record = (url: string, init: RequestInit): RecordedWorkerCall => ({
	url,
	method: init.method ?? "GET",
	headers: Object.fromEntries(new Headers(init.headers)),
	body: typeof init.body === "string" ? JSON.parse(init.body) : null,
});

const stubWorkerEnv = () => {
	vi.stubEnv("SCAN_WORKER_URL", STUB_WORKER_URL);
	vi.stubEnv("SCAN_WORKER_TOKEN", STUB_WORKER_TOKEN);
};

export const stubWorker = (status: number, body: unknown) => {
	stubWorkerEnv();
	const calls: RecordedWorkerCall[] = [];
	vi.stubGlobal(
		"fetch",
		vi.fn((url: string, init: RequestInit) => {
			calls.push(record(url, init));
			return Promise.resolve(Response.json(body, { status }));
		}),
	);
	return calls;
};

export const stubUnreachableWorker = () => {
	stubWorkerEnv();
	vi.stubGlobal(
		"fetch",
		vi.fn().mockRejectedValue(new TypeError("fetch failed")),
	);
};

const hangUntilAborted =
	(signals: AbortSignal[]) => (_url: string, init: RequestInit) =>
		new Promise<Response>((_resolve, reject) => {
			const { signal } = init;
			if (!signal) {
				return;
			}
			signals.push(signal);
			signal.addEventListener("abort", () => reject(signal.reason));
		});

export const stubHangingWorker = () => {
	stubWorkerEnv();
	const signals: AbortSignal[] = [];
	vi.stubGlobal("fetch", vi.fn(hangUntilAborted(signals)));
	return signals;
};
