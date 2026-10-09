import { SEVERITIES, type Severity } from "@refresh/scan-contracts/findings";

export const SEVERITY_LABELS: Record<Severity, string> = {
	critical: "Critical",
	serious: "Serious",
	moderate: "Moderate",
	minor: "Minor",
};

export const SEVERITY_SYMBOLS: Record<Severity, string> = {
	critical: "◆",
	serious: "▲",
	moderate: "●",
	minor: "○",
};

const LEAST_SEVERE: Severity = "minor";

export const severityRank = (severity: Severity): number =>
	SEVERITIES.indexOf(severity);

export const compareSeverity = (left: Severity, right: Severity): number =>
	severityRank(left) - severityRank(right);

export const highestSeverity = (severities: readonly Severity[]): Severity =>
	[...severities].sort(compareSeverity)[0] ?? LEAST_SEVERE;
