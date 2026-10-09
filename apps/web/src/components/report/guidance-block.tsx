type GuidanceBlockProps = {
	title: string;
	text: string;
};

export function GuidanceBlock({ title, text }: GuidanceBlockProps) {
	return (
		<div className="flex flex-col gap-1">
			<p className="font-medium text-sm">{title}</p>
			<p className="whitespace-pre-wrap break-words text-sm">{text}</p>
		</div>
	);
}
