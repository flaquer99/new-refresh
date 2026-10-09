type NewScanDialogTextProps = {
	titleId: string;
	descriptionId: string;
};

export function NewScanDialogText({
	titleId,
	descriptionId,
}: NewScanDialogTextProps) {
	return (
		<>
			<h2 className="font-semibold text-lg" id={titleId}>
				Start a new scan?
			</h2>
			<p className="mt-2" id={descriptionId}>
				This report will be lost. Reports are not saved.
			</p>
		</>
	);
}
