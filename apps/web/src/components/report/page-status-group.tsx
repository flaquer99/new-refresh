import type { PageResult } from "@refresh/scan-contracts/page-result";
import { describePageReason } from "@/lib/report/labels";

type PageStatusGroupProps = {
	title: string;
	pages: readonly PageResult[];
};

export function PageStatusGroup({ title, pages }: PageStatusGroupProps) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<h3 className="font-semibold text-lg">
				{title} ({pages.length})
			</h3>
			<ul className="flex flex-col gap-2">
				{pages.map((page) => (
					<li className="flex flex-col" key={page.url}>
						<span className="break-all">{page.url}</span>
						{page.reason === null ? null : (
							<span className="text-muted-foreground text-sm">
								{describePageReason(page)}
							</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
