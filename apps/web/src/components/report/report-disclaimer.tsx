import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const HEADING_ID = "report-disclaimer-heading";

export function ReportDisclaimer() {
	return (
		<Alert aria-labelledby={HEADING_ID} role="note">
			<AlertTitle>
				<h2
					className="font-heading font-semibold text-foreground text-lg"
					id={HEADING_ID}
				>
					About this report
				</h2>
			</AlertTitle>
			<AlertDescription className="flex flex-col gap-2 text-foreground">
				<p>
					Automated testing cannot prove WCAG conformance. It finds only part of
					the possible accessibility problems, so a clean result does not mean
					the site is accessible.
				</p>
				<p>
					Every “needs review” item must be checked by a person before you claim
					conformance with WCAG 2.2 Level AA.
				</p>
			</AlertDescription>
		</Alert>
	);
}
