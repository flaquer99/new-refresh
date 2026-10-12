import { vi } from "vitest";

export const spyOnServerLog = () => {
	const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);
	return () =>
		write.mock.calls.map(([line]) => JSON.parse(String(line)) as object);
};
