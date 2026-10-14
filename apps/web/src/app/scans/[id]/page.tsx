import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageMain } from "@/components/layout/page-main";
import { ScanStarter } from "@/components/scan/scan-starter";
import { ScanView } from "@/components/scan/scan-view";
import { scanTitle } from "@/lib/scans/page-titles";
import { loadScan } from "@/server/scans/load-scan";

type ScanLinkPageProps = PageProps<"/scans/[id]">;

export async function generateMetadata({
	params,
}: ScanLinkPageProps): Promise<Metadata> {
	const loaded = await loadScan((await params).id);
	return { title: scanTitle(loaded?.scan.startUrl ?? null) };
}

export default async function ScanLinkPage({ params }: ScanLinkPageProps) {
	const loaded = await loadScan((await params).id);
	if (!loaded) {
		notFound();
	}
	const { scan, canManage } = loaded;
	return (
		<PageMain>
			<h1 className="break-all font-semibold text-3xl">
				Scan of {scan.startUrl}
			</h1>
			<ScanStarter name={scan.startedByName} />
			<ScanView canManage={canManage} scan={scan} />
		</PageMain>
	);
}
