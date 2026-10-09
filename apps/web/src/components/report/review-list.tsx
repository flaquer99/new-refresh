import type { ReviewItem } from "@refresh/scan-contracts/findings";
import { ReviewItemCard } from "./review-item-card";

type ReviewListProps = {
	items: readonly ReviewItem[];
};

export function ReviewList({ items }: ReviewListProps) {
	return (
		<section className="flex min-w-0 flex-col gap-3">
			<h3 className="font-semibold text-lg">Inconclusive automated checks</h3>
			{items.length === 0 ? (
				<p>None found.</p>
			) : (
				<ul className="flex flex-col gap-3">
					{items.map((item) => (
						<li key={item.id}>
							<ReviewItemCard item={item} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
