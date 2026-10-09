import type { Violation } from "@refresh/scan-contracts/findings";
import { useReportFilters } from "@/hooks/use-report-filters";
import { FilterResultCount } from "./filter-result-count";
import { ReportFilters } from "./report-filters";
import { ViolationGroups } from "./violation-groups";

const HEADING_ID = "violations-heading";

type ViolationsSectionProps = {
	violations: readonly Violation[];
};

export function ViolationsSection({ violations }: ViolationsSectionProps) {
	const view = useReportFilters(violations);
	return (
		<section aria-labelledby={HEADING_ID} className="flex flex-col gap-4">
			<h2 className="font-semibold text-xl" id={HEADING_ID}>
				Violations
			</h2>
			{violations.length === 0 ? (
				<p>No automated violations were found.</p>
			) : (
				<>
					<ReportFilters
						filters={view.filters}
						groupBy={view.groupBy}
						onFilterChange={view.setFilter}
						onGroupByChange={view.setGroupBy}
					/>
					<FilterResultCount
						total={violations.length}
						visible={view.visibleCount}
					/>
					<ViolationGroups groups={view.groups} />
				</>
			)}
		</section>
	);
}
