"use client";

import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { useStartScan } from "@/hooks/use-start-scan";
import { ScanForm } from "./scan-form";

type StartScanFormProps = {
	initialRequest: ScanRequest | null;
};

export function StartScanForm({ initialRequest }: StartScanFormProps) {
	const { isStarting, error, start } = useStartScan();
	return (
		<div className="flex flex-col gap-4">
			<ScanForm
				focusOnMount={initialRequest !== null}
				initialRequest={initialRequest}
				isStarting={isStarting}
				onSubmit={start}
			/>
			{error ? (
				<p className="text-destructive" role="alert">
					{error.message}
				</p>
			) : null}
		</div>
	);
}
