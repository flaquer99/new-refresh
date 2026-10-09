import type { Severity, Violation } from "@refresh/scan-contracts/findings";
import { compareSeverity, highestSeverity } from "./severity";

export const GROUP_BY_OPTIONS = ["criterion", "page"] as const;

export type GroupBy = (typeof GROUP_BY_OPTIONS)[number];

export type ViolationGroup = {
	key: string;
	label: string;
	count: number;
	highestSeverity: Severity;
	violations: Violation[];
};

type GroupIdentity = Pick<ViolationGroup, "key" | "label">;

const identify = (violation: Violation, groupBy: GroupBy): GroupIdentity[] => {
	if (groupBy === "page") {
		return [{ key: violation.pageUrl, label: violation.pageUrl }];
	}
	return violation.criteria.map(({ id, name }) => ({
		key: id,
		label: `${id} ${name}`,
	}));
};

const toGroup = (
	identity: GroupIdentity,
	violations: Violation[],
): ViolationGroup => {
	const sorted = [...violations].sort((left, right) =>
		compareSeverity(left.severity, right.severity),
	);
	return {
		...identity,
		count: sorted.length,
		highestSeverity: highestSeverity(sorted.map(({ severity }) => severity)),
		violations: sorted,
	};
};

const compareGroups = (left: ViolationGroup, right: ViolationGroup): number =>
	compareSeverity(left.highestSeverity, right.highestSeverity) ||
	left.key.localeCompare(right.key, "en", { numeric: true });

export const groupViolations = (
	violations: readonly Violation[],
	groupBy: GroupBy,
): ViolationGroup[] => {
	const buckets = new Map<
		string,
		{ identity: GroupIdentity; items: Violation[] }
	>();
	for (const violation of violations) {
		for (const identity of identify(violation, groupBy)) {
			const bucket = buckets.get(identity.key) ?? { identity, items: [] };
			bucket.items.push(violation);
			buckets.set(identity.key, bucket);
		}
	}
	return [...buckets.values()]
		.map(({ identity, items }) => toGroup(identity, items))
		.sort(compareGroups);
};
