import type { CheckScope, ManualCheck } from "@refresh/scan-contracts/findings";
import { MonoValue } from "@/components/hud/mono-value";
import { NEEDS_REVIEW_CARD_CLASSES } from "./review-item-card";
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
		<article aria-labelledby={headingId} className={NEEDS_REVIEW_CARD_CLASSES}>
			<h4 className="font-heading font-semibold" id={headingId}>
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
			<ul className="flex flex-col gap-1 text-muted-foreground">
				{check.pages.map((page) => (
					<li key={page}>
						<MonoValue>{page}</MonoValue>
					</li>
				))}
			</ul>
		</article>
	);
}
