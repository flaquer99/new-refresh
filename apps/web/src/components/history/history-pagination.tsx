import Link from "next/link";
import { HISTORY_PATH, olderScansPath } from "@/lib/scans/scan-links";

const LINK_CLASSES =
	"rounded-md border border-border px-4 py-2 font-medium hover:bg-muted";

type HistoryPaginationProps = {
	nextBefore: string | null;
	isPaged: boolean;
};

export function HistoryPagination({
	nextBefore,
	isPaged,
}: HistoryPaginationProps) {
	if (nextBefore === null && !isPaged) {
		return null;
	}
	return (
		<nav aria-label="History pages">
			<ul className="flex flex-wrap gap-3">
				{isPaged ? (
					<li>
						<Link className={LINK_CLASSES} href={HISTORY_PATH}>
							Newest scans
						</Link>
					</li>
				) : null}
				{nextBefore === null ? null : (
					<li>
						<Link className={LINK_CLASSES} href={olderScansPath(nextBefore)}>
							Older scans
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
}
