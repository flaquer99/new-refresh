import type { ReportOutcome } from "@refresh/scan-contracts/report";
import type { ScanStatusValue } from "@refresh/scan-contracts/scan-status";
import { Badge } from "@/components/ui/badge";
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
				<Badge variant="outline">{OUTCOME_LABELS[outcome]}</Badge>
			) : null}
		</span>
	);
}
