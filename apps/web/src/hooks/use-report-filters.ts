import type { Violation } from "@refresh/scan-contracts/findings";
import { useState } from "react";
import {
	ALL_VIOLATIONS,
	filterViolations,
	type ViolationFilters,
} from "@/lib/report/filter-violations";
import {
	type GroupBy,
	groupViolations,
	type ViolationGroup,
} from "@/lib/report/group-violations";

export type SetFilter = <K extends keyof ViolationFilters>(
	key: K,
	value: ViolationFilters[K],
) => void;

export type UseReportFilters = {
	filters: ViolationFilters;
	groupBy: GroupBy;
	groups: ViolationGroup[];
	visibleCount: number;
	setFilter: SetFilter;
	setGroupBy: (groupBy: GroupBy) => void;
};

export function useReportFilters(
	violations: readonly Violation[],
): UseReportFilters {
	const [filters, setFilters] = useState<ViolationFilters>(ALL_VIOLATIONS);
	const [groupBy, setGroupBy] = useState<GroupBy>("criterion");
	const visible = filterViolations(violations, filters);
	const setFilter: SetFilter = (key, value) => {
		setFilters((current) => ({ ...current, [key]: value }));
	};
	return {
		filters,
		groupBy,
		groups: groupViolations(visible, groupBy),
		visibleCount: visible.length,
		setFilter,
		setGroupBy,
	};
}
