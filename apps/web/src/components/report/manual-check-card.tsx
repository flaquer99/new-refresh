import type { CheckScope, ManualCheck } from "@refresh/scan-contracts/findings";
import { UnderstandingLink } from "./understanding-link";

const SCOPE_LABELS: Record<CheckScope, string> = {
	page: "Applies to the pages listed",
	site: "Applies to the whole site",
};

type ManualCheckCardProps = {
	check: ManualCheck;
};

export function ManualCheckCard({ check }: ManualCheckCardProps) {
	const { criterion } = check;
	const headingId = `manual-check-${criterion.id.replaceAll(".", "-")}-${check.scope}`;
	return (
		<article
			aria-labelledby={headingId}
			className="flex flex-col gap-2 rounded-lg border border-border p-4"
		>
			<h4 className="font-semibold" id={headingId}>
				{criterion.id} {criterion.name}
			</h4>
			<p className="flex flex-wrap gap-x-2 text-sm">
				<span>Level {criterion.level}</span>
				<span>{SCOPE_LABELS[check.scope]}</span>
				<UnderstandingLink criterion={criterion} />
			</p>
			<p className="whitespace-pre-wrap break-words text-sm">
				{check.guidance}
			</p>
			<ul className="flex flex-col gap-1 text-muted-foreground text-sm">
				{check.pages.map((page) => (
					<li className="break-all" key={page}>
						{page}
					</li>
				))}
			</ul>
		</article>
	);
}
