import type { CriterionRef } from "@refresh/scan-contracts/findings";
import { CriterionLink } from "./criterion-link";

type CriteriaListProps = {
	criteria: readonly CriterionRef[];
};

export function CriteriaList({ criteria }: CriteriaListProps) {
	return (
		<ul className="flex flex-col gap-1">
			{criteria.map((criterion) => (
				<li key={criterion.id}>
					<CriterionLink criterion={criterion} />
				</li>
			))}
		</ul>
	);
}
