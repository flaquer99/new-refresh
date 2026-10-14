import type { ScanStatus } from "@refresh/scan-contracts/scan-status";
import { useEffect, useEffectEvent, useRef } from "react";
import { reloadPage } from "@/lib/scans/reload-page";
import type { ApiResult } from "@/lib/scans/request-json";
import {
	type ResultHandler,
	schedulePolling,
} from "@/lib/scans/schedule-polling";

type UseScanPollingParams = {
	scanId: string | null;
	onResult: ResultHandler;
};

const doNothing = () => undefined;

const isSessionExpired = (result: ApiResult<ScanStatus>): boolean =>
	!result.ok && result.error.code === "UNAUTHORIZED";

export function useScanPolling({ scanId, onResult }: UseScanPollingParams) {
	const handleResult = useEffectEvent(onResult);
	const pollNowRef = useRef<() => void>(doNothing);
	useEffect(() => {
		if (scanId === null) {
			return;
		}
		const polling = schedulePolling(scanId, (result) => {
			if (isSessionExpired(result)) {
				reloadPage();
				return;
			}
			handleResult(result);
		});
		pollNowRef.current = polling.pollNow;
		return () => {
			polling.stop();
			pollNowRef.current = doNothing;
		};
	}, [scanId]);
	const pollNow = () => {
		pollNowRef.current();
	};
	return { pollNow };
}
