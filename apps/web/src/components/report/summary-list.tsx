export type SummaryItem = {
	term: string;
	value: string | number;
};

type SummaryListProps = {
	title: string;
	items: readonly SummaryItem[];
};

export function SummaryList({ title, items }: SummaryListProps) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<h3 className="font-semibold">{title}</h3>
			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
				{items.map(({ term, value }) => (
					<div className="contents" key={term}>
						<dt className="text-muted-foreground">{term}</dt>
						<dd className="break-all font-medium tabular-nums">{value}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
