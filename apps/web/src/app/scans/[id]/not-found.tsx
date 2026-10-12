import Link from "next/link";
import { HISTORY_PATH, NEW_SCAN_PATH } from "@/lib/scans/scan-links";

const LINK_CLASSES = "font-medium text-primary underline underline-offset-4";

export default function ScanNotFound() {
	return (
		<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6 sm:py-12">
			<h1 className="font-semibold text-3xl">Scan not found</h1>
			<p>This scan doesn't exist. It may have been deleted.</p>
			<ul className="flex flex-wrap gap-4">
				<li>
					<Link className={LINK_CLASSES} href={HISTORY_PATH}>
						Scan history
					</Link>
				</li>
				<li>
					<Link className={LINK_CLASSES} href={NEW_SCAN_PATH}>
						Start a new scan
					</Link>
				</li>
			</ul>
		</main>
	);
}
