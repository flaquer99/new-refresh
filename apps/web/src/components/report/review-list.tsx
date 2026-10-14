import type { ReviewItem } from "@refresh/scan-contracts/findings";
import { ReviewItemCard } from "./review-item-card";

type ReviewListProps = {
	scanId: string;
	items: readonly ReviewItem[];
};

export function ReviewList({ items, scanId }: ReviewListProps) {
	return (
		<section className="flex min-w-0 flex-col gap-3">
			<h3 className="font-heading font-semibold text-lg">
				Inconclusive automated checks
			</h3>
			{items.length === 0 ? (
				<p>None found.</p>
			) : (
				<ul className="flex flex-col gap-3">
					{items.map((item) => (
						<li key={item.id}>
							<ReviewItemCard item={item} scanId={scanId} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
