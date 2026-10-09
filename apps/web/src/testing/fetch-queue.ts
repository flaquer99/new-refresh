import { vi } from "vitest";

type QueuedResponse = { body: unknown; status?: number };

export const stubFetchQueue = (responses: QueuedResponse[]) => {
	const queue = [...responses];
	const fetchMock = vi.fn<typeof fetch>(async () => {
		const next = queue.length > 1 ? queue.shift() : queue[0];
		if (next === undefined) {
			throw new Error("No queued response for fetch");
		}
		return await Promise.resolve(
			Response.json(next.body, { status: next.status ?? 200 }),
		);
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
};

export const callsWithMethod = (
	fetchMock: ReturnType<typeof stubFetchQueue>,
	method: string,
): number =>
	fetchMock.mock.calls.filter(([, init]) => init?.method === method).length;
