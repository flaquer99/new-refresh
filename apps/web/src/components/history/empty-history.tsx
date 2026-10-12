import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
} from "@/components/ui/empty";
import { NEW_SCAN_PATH } from "@/lib/scans/scan-links";

const NO_SCANS_MESSAGE =
	"No scans yet. Every scan anyone runs appears here, newest first.";
const NO_OLDER_SCANS_MESSAGE =
	"No older scans. Go back to the newest scans to see recent ones.";

type EmptyHistoryProps = {
	isPaged: boolean;
};

export function EmptyHistory({ isPaged }: EmptyHistoryProps) {
	return (
		<Empty className="hud-frame bg-card">
			<EmptyHeader>
				<EmptyDescription>
					{isPaged ? NO_OLDER_SCANS_MESSAGE : NO_SCANS_MESSAGE}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Link className={buttonVariants()} href={NEW_SCAN_PATH}>
					Start a new scan
				</Link>
			</EmptyContent>
		</Empty>
	);
}
