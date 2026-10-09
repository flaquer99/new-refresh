import type { ViolationGroup } from "@/lib/report/group-violations";
import { ViolationCard } from "./violation-card";

type ViolationGroupsProps = {
	groups: readonly ViolationGroup[];
};

export function ViolationGroups({ groups }: ViolationGroupsProps) {
	if (groups.length === 0) {
		return <p>No violations match the selected filters.</p>;
	}
	return (
		<div className="flex flex-col gap-6">
			{groups.map((group) => (
				<section className="flex min-w-0 flex-col gap-3" key={group.key}>
					<h3 className="break-all font-semibold text-lg">
						{group.label} ({group.count})
					</h3>
					<ul className="flex flex-col gap-3">
						{group.violations.map((violation) => (
							<li key={violation.id}>
								<ViolationCard violation={violation} />
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
