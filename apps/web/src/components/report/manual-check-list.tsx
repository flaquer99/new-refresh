import type { ManualCheck } from "@refresh/scan-contracts/findings";
import { ManualCheckCard } from "./manual-check-card";

type ManualCheckListProps = {
	checks: readonly ManualCheck[];
};

export function ManualCheckList({ checks }: ManualCheckListProps) {
	return (
		<section className="flex min-w-0 flex-col gap-3">
			<h3 className="font-semibold text-lg">Manual checks</h3>
			{checks.length === 0 ? (
				<p>None found.</p>
			) : (
				<ul className="flex flex-col gap-3">
					{checks.map((check) => (
						<li key={`${check.criterion.id}-${check.scope}`}>
							<ManualCheckCard check={check} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
