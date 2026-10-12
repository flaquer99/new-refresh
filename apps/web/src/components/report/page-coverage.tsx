import {
	PAGE_STATUSES,
	type PageResult,
	type PageStatus,
} from "@refresh/scan-contracts/page-result";
import { HudPanel } from "@/components/hud/hud-panel";
import { PageStatusGroup } from "./page-status-group";

const HEADING_ID = "page-coverage-heading";

const STATUS_TITLES: Record<PageStatus, string> = {
	scanned: "Scanned",
	skipped: "Skipped",
	failed: "Failed",
};

type PageCoverageProps = {
	pages: readonly PageResult[];
};

const groupsOf = (pages: readonly PageResult[]) =>
	PAGE_STATUSES.map((status) => ({
		status,
		pages: pages.filter((page) => page.status === status),
	})).filter((group) => group.pages.length > 0);

export function PageCoverage({ pages }: PageCoverageProps) {
	return (
		<HudPanel labelledBy={HEADING_ID}>
			<h2 className="font-heading font-semibold text-xl" id={HEADING_ID}>
				Page coverage
			</h2>
			{groupsOf(pages).map((group) => (
				<PageStatusGroup
					key={group.status}
					pages={group.pages}
					title={STATUS_TITLES[group.status]}
				/>
			))}
		</HudPanel>
	);
}
