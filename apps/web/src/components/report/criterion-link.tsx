import type { CriterionRef } from "@refresh/scan-contracts/findings";
import { UnderstandingLink } from "./understanding-link";

type CriterionLinkProps = {
	criterion: CriterionRef;
};

export function CriterionLink({ criterion }: CriterionLinkProps) {
	return (
		<span className="flex flex-wrap items-baseline gap-x-2">
			<span className="font-medium">
				{criterion.id} {criterion.name}
			</span>
			<span className="text-muted-foreground text-sm">
				Level {criterion.level}
			</span>
			<UnderstandingLink criterion={criterion} />
		</span>
	);
}
