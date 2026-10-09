import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScanView } from "@/components/scan/scan-view";
import { scanTitle } from "@/lib/scans/page-titles";
import { loadScan } from "@/server/scans/load-scan";

type ScanLinkPageProps = PageProps<"/scans/[id]">;

export async function generateMetadata({
	params,
}: ScanLinkPageProps): Promise<Metadata> {
	const scan = await loadScan((await params).id);
	return { title: scanTitle(scan?.startUrl ?? null) };
}

export default async function ScanLinkPage({ params }: ScanLinkPageProps) {
	const scan = await loadScan((await params).id);
	if (!scan) {
		notFound();
	}
	return (
		<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<h1 className="break-all font-semibold text-3xl">
				Scan of {scan.startUrl}
			</h1>
			<ScanView scan={scan} />
		</main>
	);
}
