import type { ScanError } from "@refresh/scan-contracts/errors";
import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startScan } from "@/lib/scans/scan-api";
import { scanLinkPath } from "@/lib/scans/scan-links";

export function useStartScan() {
	const router = useRouter();
	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState<ScanError | null>(null);
	const start = async (request: ScanRequest) => {
		setIsStarting(true);
		setError(null);
		const result = await startScan(request);
		if (result.ok) {
			router.push(scanLinkPath(result.data.scanId));
			return;
		}
		setError(result.error);
		setIsStarting(false);
	};
	return { isStarting, error, start };
}
