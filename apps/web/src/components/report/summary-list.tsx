import { HudStat, type HudStatTone } from "@/components/hud/hud-stat";
import { MonoValue } from "@/components/hud/mono-value";

export type SummaryItem = {
	term: string;
	value: string | number;
	tone?: HudStatTone;
};

type SummaryListProps = {
	title: string;
	items: readonly SummaryItem[];
};

const displayValue = (value: string | number) =>
	typeof value === "string" ? (
		<MonoValue className="text-base">{value}</MonoValue>
	) : (
		value
	);

export function SummaryList({ title, items }: SummaryListProps) {
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<h3 className="font-heading font-semibold">{title}</h3>
			<dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
				{items.map(({ term, value, tone }) => (
					<HudStat
						key={term}
						term={term}
						tone={tone}
						value={displayValue(value)}
					/>
				))}
			</dl>
		</div>
	);
}
