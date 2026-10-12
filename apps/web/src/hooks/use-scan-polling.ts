import { useEffect, useEffectEvent, useRef } from "react";
import {
	type ResultHandler,
	schedulePolling,
} from "@/lib/scans/schedule-polling";

type UseScanPollingParams = {
	scanId: string | null;
	onResult: ResultHandler;
};

const doNothing = () => undefined;

export function useScanPolling({ scanId, onResult }: UseScanPollingParams) {
	const handleResult = useEffectEvent(onResult);
	const pollNowRef = useRef<() => void>(doNothing);
	useEffect(() => {
		if (scanId === null) {
			return;
		}
		const polling = schedulePolling(scanId, (result) => handleResult(result));
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
