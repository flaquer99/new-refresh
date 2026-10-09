import type { CriterionRef } from "@refresh/scan-contracts/findings";

type UnderstandingLinkProps = {
	criterion: CriterionRef;
};

export function UnderstandingLink({ criterion }: UnderstandingLinkProps) {
	return (
		<a
			className="text-primary text-sm underline underline-offset-2"
			href={criterion.understandingUrl}
			rel="noopener noreferrer"
			target="_blank"
		>
			Understanding {criterion.id}
			<span className="sr-only"> {criterion.name} (opens in a new tab)</span>
		</a>
	);
}
