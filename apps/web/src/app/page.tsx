import { ScanPage } from "@/components/scan/scan-page";

export default function Home() {
	return (
		<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<header className="flex flex-col gap-2">
				<p className="font-medium text-muted-foreground">Refresh</p>
				<h1 className="font-semibold text-3xl">WCAG 2.2 accessibility scan</h1>
				<p className="text-muted-foreground">
					Check a website against the WCAG 2.2 Level A and AA success criteria
					and get plain-language guidance for every issue found.
				</p>
			</header>
			<ScanPage />
		</main>
	);
}
