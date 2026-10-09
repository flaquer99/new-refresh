"use client";

import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { ReportView } from "@/components/report/report-view";
import { useLeaveWarning } from "@/hooks/use-leave-warning";
import { useReturnToForm } from "@/hooks/use-return-to-form";
import { useScan } from "@/hooks/use-scan";
import { ScanErrorView } from "./scan-error";
import { ScanForm } from "./scan-form";
import { ScanProgress } from "./scan-progress";

export function ScanPage() {
	const { state, start, cancel, reset } = useScan();
	const { hasReturned, draft, rememberDraft, backToForm, startNewScan } =
		useReturnToForm(reset);
	useLeaveWarning(state.phase === "finished");
	const submit = async (request: ScanRequest) => {
		rememberDraft(request);
		await start(request);
	};
	switch (state.phase) {
		case "running":
			return <ScanProgress onCancel={cancel} progress={state.progress} />;
		case "finished":
			return <ReportView onNewScan={startNewScan} report={state.report} />;
		case "failed":
			return <ScanErrorView error={state.error} onBack={backToForm} />;
		default:
			return (
				<ScanForm
					focusOnMount={hasReturned}
					initialRequest={draft}
					isStarting={state.phase === "starting"}
					onSubmit={submit}
				/>
			);
	}
}
