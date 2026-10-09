import type { Metadata } from "next";
import { EmptyHistory } from "@/components/history/empty-history";
import { HistoryAnnouncer } from "@/components/history/history-announcer";
import { HistoryPagination } from "@/components/history/history-pagination";
import { ScanHistoryList } from "@/components/history/scan-history-list";
import { readBefore } from "@/lib/history/history-labels";
import { historyTitle } from "@/lib/scans/page-titles";
import { loadHistory } from "@/server/scans/load-history";

const HEADING_ID = "scan-history-heading";

type HistoryPageProps = PageProps<"/scans">;

export async function generateMetadata({
	searchParams,
}: HistoryPageProps): Promise<Metadata> {
	return { title: historyTitle(readBefore(await searchParams)) };
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
	const before = readBefore(await searchParams);
	const page = await loadHistory(before);
	return (
		<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
			<h1 className="font-semibold text-3xl" id={HEADING_ID} tabIndex={-1}>
				{historyTitle(before)}
			</h1>
			<HistoryAnnouncer focusTargetId={HEADING_ID}>
				{page.entries.length === 0 ? (
					<EmptyHistory />
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
		</main>
	);
}
