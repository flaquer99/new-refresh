import Link from "next/link";
import { PageMain } from "@/components/layout/page-main";
import { buttonVariants } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
} from "@/components/ui/empty";
import { HISTORY_PATH, NEW_SCAN_PATH } from "@/lib/scans/scan-links";

export default function ScanNotFound() {
	return (
		<PageMain className="gap-6">
			<Empty className="hud-frame bg-card">
				<EmptyHeader>
					<h1 className="font-semibold text-3xl">Scan not found</h1>
					<EmptyDescription>
						This scan doesn't exist. It may have been deleted.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<ul className="flex flex-wrap justify-center gap-3">
						<li>
							<Link className={buttonVariants()} href={NEW_SCAN_PATH}>
								Start a new scan
							</Link>
						</li>
						<li>
							<Link
								className={buttonVariants({ variant: "outline" })}
								href={HISTORY_PATH}
							>
								Scan history
							</Link>
						</li>
					</ul>
				</EmptyContent>
			</Empty>
		</PageMain>
	);
}
