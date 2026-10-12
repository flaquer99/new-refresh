import { PageMain } from "@/components/layout/page-main";
import { HomeHero } from "@/components/scan/home-hero";
import { StartScanForm } from "@/components/scan/start-scan-form";
import { readPrefill, runAgainHref } from "@/lib/scans/prefill";
import { NEW_SCAN_PATH } from "@/lib/scans/scan-links";

export default async function Home({ searchParams }: PageProps<"/">) {
	const prefill = readPrefill(await searchParams);
	return (
		<PageMain>
			<HomeHero />
			<StartScanForm
				initialRequest={prefill}
				key={prefill ? runAgainHref(prefill) : NEW_SCAN_PATH}
			/>
		</PageMain>
	);
}
