import type { SetFilter } from "@/hooks/use-report-filters";
import { GROUP_BY_SELECT_OPTIONS } from "@/lib/report/filter-options";
import type { ViolationFilters } from "@/lib/report/filter-violations";
import type { GroupBy } from "@/lib/report/group-violations";
import { SelectField } from "./select-field";
import { ViolationFilterFields } from "./violation-filter-fields";

type ReportFiltersProps = {
	filters: ViolationFilters;
	groupBy: GroupBy;
	onFilterChange: SetFilter;
	onGroupByChange: (groupBy: GroupBy) => void;
};

export function ReportFilters({
	filters,
	groupBy,
	onFilterChange,
	onGroupByChange,
}: ReportFiltersProps) {
	return (
		<fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4">
			<legend className="px-1 font-semibold">
				Group and filter violations
			</legend>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<SelectField
					id="violations-group-by"
					label="Group by"
					onChange={onGroupByChange}
					options={GROUP_BY_SELECT_OPTIONS}
					value={groupBy}
				/>
				<ViolationFilterFields
					filters={filters}
					onFilterChange={onFilterChange}
				/>
			</div>
		</fieldset>
	);
}
