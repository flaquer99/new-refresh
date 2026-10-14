import { redirect } from "next/navigation";
import { LandingView } from "@/components/landing/landing-view";
import { PageMain } from "@/components/layout/page-main";
import { HomeHero } from "@/components/scan/home-hero";
import { StartScanForm } from "@/components/scan/start-scan-form";
import { readPrefill, runAgainHref } from "@/lib/scans/prefill";
import { NEW_SCAN_PATH } from "@/lib/scans/scan-links";
import { ONBOARDING_PATH } from "@/server/auth/auth-constants";
import { getScanActor } from "@/server/auth/get-scan-actor";

export default async function Home({ searchParams }: PageProps<"/">) {
	const result = await getScanActor();
	if (!result.ok && result.code === "UNAUTHORIZED") {
		return (
			<PageMain>
				<LandingView />
			</PageMain>
		);
	}
	if (!result.ok) {
		return redirect(ONBOARDING_PATH);
	}
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
