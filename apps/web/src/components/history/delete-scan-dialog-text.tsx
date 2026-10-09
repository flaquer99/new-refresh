type DeleteScanDialogTextProps = {
	titleId: string;
	descriptionId: string;
	startUrl: string;
};

export function DeleteScanDialogText({
	titleId,
	descriptionId,
	startUrl,
}: DeleteScanDialogTextProps) {
	return (
		<>
			<h2 className="font-semibold text-lg" id={titleId}>
				Delete this scan?
			</h2>
			<p className="mt-2" id={descriptionId}>
				The scan of <span className="break-all font-medium">{startUrl}</span>{" "}
				and its report will be removed permanently. This can't be undone.
			</p>
		</>
	);
}
