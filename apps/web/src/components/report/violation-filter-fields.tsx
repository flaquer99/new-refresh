import type { SetFilter } from "@/hooks/use-report-filters";
import {
	LEVEL_OPTIONS,
	SEVERITY_OPTIONS,
	VIEWPORT_OPTIONS,
} from "@/lib/report/filter-options";
import type { ViolationFilters } from "@/lib/report/filter-violations";
import { SelectField } from "./select-field";

type ViolationFilterFieldsProps = {
	filters: ViolationFilters;
	onFilterChange: SetFilter;
};

export function ViolationFilterFields({
	filters,
	onFilterChange,
}: ViolationFilterFieldsProps) {
	return (
		<>
			<SelectField
				id="violations-severity"
				label="Severity"
				onChange={(value) => onFilterChange("severity", value)}
				options={SEVERITY_OPTIONS}
				value={filters.severity}
			/>
			<SelectField
				id="violations-level"
				label="Level"
				onChange={(value) => onFilterChange("level", value)}
				options={LEVEL_OPTIONS}
				value={filters.level}
			/>
			<SelectField
				id="violations-viewport"
				label="Viewport"
				onChange={(value) => onFilterChange("viewport", value)}
				options={VIEWPORT_OPTIONS}
				value={filters.viewport}
			/>
		</>
	);
}
