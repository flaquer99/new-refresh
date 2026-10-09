import { vi } from "vitest";

export const stubFetch = (response: Response | Error) => {
	const fetchMock = vi.fn<typeof fetch>();
	if (response instanceof Error) {
		fetchMock.mockRejectedValue(response);
	} else {
		fetchMock.mockResolvedValue(response);
	}
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
};
