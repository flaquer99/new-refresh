const UNITS = [
	["year", 31_536_000_000],
	["month", 2_592_000_000],
	["week", 604_800_000],
	["day", 86_400_000],
	["hour", 3_600_000],
	["minute", 60_000],
] as const;

const JUST_NOW = "just now";

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
	numeric: "auto",
});

const exactFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "UTC",
});

export const formatRelativeTime = (iso: string, now: Date): string => {
	const elapsed = new Date(iso).getTime() - now.getTime();
	for (const [unit, unitMs] of UNITS) {
		if (Math.abs(elapsed) >= unitMs) {
			return relativeFormatter.format(Math.round(elapsed / unitMs), unit);
		}
	}
	return JUST_NOW;
};

export const formatExactTime = (iso: string): string =>
	`${exactFormatter.format(new Date(iso))} UTC`;
