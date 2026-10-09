import {
	SEVERITIES,
	type Severity,
	VIEWPORTS,
	type Viewport,
	WCAG_LEVELS,
	type WcagLevel,
} from "@refresh/scan-contracts/findings";
import { ANY, type AnyOption } from "./filter-violations";
import type { GroupBy } from "./group-violations";
import { VIEWPORT_LABELS } from "./labels";
import { SEVERITY_LABELS } from "./severity";

export type SelectOption<T extends string> = {
	value: T;
	label: string;
};

export const GROUP_BY_SELECT_OPTIONS: SelectOption<GroupBy>[] = [
	{ value: "criterion", label: "Success criterion" },
	{ value: "page", label: "Page" },
];

export const SEVERITY_OPTIONS: SelectOption<Severity | AnyOption>[] = [
	{ value: ANY, label: "All severities" },
	...SEVERITIES.map((value) => ({ value, label: SEVERITY_LABELS[value] })),
];

export const LEVEL_OPTIONS: SelectOption<WcagLevel | AnyOption>[] = [
	{ value: ANY, label: "All levels" },
	...WCAG_LEVELS.map((value) => ({ value, label: `Level ${value}` })),
];

export const VIEWPORT_OPTIONS: SelectOption<Viewport | AnyOption>[] = [
	{ value: ANY, label: "All viewports" },
	...VIEWPORTS.map((value) => ({ value, label: VIEWPORT_LABELS[value] })),
];
