const HEADING_ID = "report-disclaimer-heading";

export function ReportDisclaimer() {
	return (
		<div
			aria-labelledby={HEADING_ID}
			className="flex flex-col gap-2 rounded-lg border border-border bg-muted p-4"
			role="note"
		>
			<h2 className="font-semibold text-lg" id={HEADING_ID}>
				About this report
			</h2>
			<p>
				Automated testing cannot prove WCAG conformance. It finds only part of
				the possible accessibility problems, so a clean result does not mean the
				site is accessible.
			</p>
			<p>
				Every “needs review” item must be checked by a person before you claim
				conformance with WCAG 2.2 Level AA.
			</p>
		</div>
	);
}
