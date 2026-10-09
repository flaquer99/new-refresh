import type {
	Severity,
	Viewport,
	Violation,
	WcagLevel,
} from "@refresh/scan-contracts/findings";

export const ANY = "all";

export type AnyOption = typeof ANY;

export type ViolationFilters = {
	severity: Severity | AnyOption;
	level: WcagLevel | AnyOption;
	viewport: Viewport | AnyOption;
};

export const ALL_VIOLATIONS: ViolationFilters = {
	severity: ANY,
	level: ANY,
	viewport: ANY,
};

const matches = (violation: Violation, filters: ViolationFilters): boolean => {
	if (filters.severity !== ANY && violation.severity !== filters.severity) {
		return false;
	}
	if (filters.level !== ANY && violation.level !== filters.level) {
		return false;
	}
	return (
		filters.viewport === ANY || violation.viewports.includes(filters.viewport)
	);
};

export const filterViolations = (
	violations: readonly Violation[],
	filters: ViolationFilters,
): Violation[] => violations.filter((violation) => matches(violation, filters));
