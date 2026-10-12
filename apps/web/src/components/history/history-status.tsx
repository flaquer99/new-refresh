import type { ReportOutcome } from "@refresh/scan-contracts/report";
import type { ScanStatusValue } from "@refresh/scan-contracts/scan-status";
import { isPartialOutcome, STATUS_LABELS } from "@/lib/history/history-labels";
import { OUTCOME_LABELS } from "@/lib/report/labels";

type HistoryStatusProps = {
	status: ScanStatusValue;
	outcome: ReportOutcome | null;
};

export function HistoryStatus({ status, outcome }: HistoryStatusProps) {
	return (
		<span className="flex flex-wrap items-center gap-2">
			{STATUS_LABELS[status]}
			{outcome !== null && isPartialOutcome(outcome) ? (
				<span className="rounded-full border border-border px-2 py-0.5 text-xs">
					{OUTCOME_LABELS[outcome]}
				</span>
			) : null}
		</span>
	);
}
