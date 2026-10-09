import { act, renderHook } from "@testing-library/react";
import { useScan } from "@/hooks/use-scan";
import { START_URL } from "./finding-fixtures";

const REQUEST = { url: START_URL, depth: 1 } as const;

export const startScanHook = async () => {
	const hook = renderHook(() => useScan());
	await act(async () => {
		await hook.result.current.start(REQUEST);
	});
	return hook;
};
