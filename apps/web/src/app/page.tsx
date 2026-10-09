import { StartScanForm } from "@/components/scan/start-scan-form";
import { readPrefill } from "@/lib/scans/prefill";

export default async function Home({ searchParams }: PageProps<"/">) {
	const prefill = readPrefill(await searchParams);
	return (
		<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-3xl">WCAG 2.2 accessibility scan</h1>
				<p className="text-muted-foreground">
					Check a website against the WCAG 2.2 Level A and AA success criteria
					and get plain-language guidance for every issue found.
				</p>
			</div>
			<StartScanForm initialRequest={prefill} />
		</main>
	);
}
