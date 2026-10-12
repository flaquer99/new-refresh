import type { Metadata } from "next";
import { EmptyHistory } from "@/components/history/empty-history";
import { HistoryAnnouncer } from "@/components/history/history-announcer";
import { HistoryPagination } from "@/components/history/history-pagination";
import { ScanHistoryList } from "@/components/history/scan-history-list";
import { PageMain } from "@/components/layout/page-main";
import { historyTitle } from "@/lib/scans/page-titles";
import { readHistoryCursor } from "@/server/scans/history-cursor-param";
import { loadHistory } from "@/server/scans/load-history";

const HEADING_ID = "scan-history-heading";

type HistoryPageProps = PageProps<"/scans">;

export async function generateMetadata({
	searchParams,
}: HistoryPageProps): Promise<Metadata> {
	return { title: historyTitle(readHistoryCursor(await searchParams)) };
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
	const before = readHistoryCursor(await searchParams);
	const page = await loadHistory(before);
	return (
		<PageMain className="gap-6">
			<h1 className="font-semibold text-3xl" id={HEADING_ID} tabIndex={-1}>
				{historyTitle(before)}
			</h1>
			<HistoryAnnouncer focusTargetId={HEADING_ID}>
				{page.entries.length === 0 ? (
					<EmptyHistory isPaged={before !== null} />
				) : (
					<ScanHistoryList
						entries={page.entries}
						labelledBy={HEADING_ID}
						now={new Date()}
					/>
				)}
			</HistoryAnnouncer>
			<HistoryPagination
				isPaged={before !== null}
				nextBefore={page.nextBefore}
			/>
		</PageMain>
	);
}
