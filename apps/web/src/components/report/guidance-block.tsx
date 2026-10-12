type GuidanceBlockProps = {
	title: string;
	text: string;
};

export function GuidanceBlock({ title, text }: GuidanceBlockProps) {
	return (
		<div className="flex flex-col gap-1 border-border border-l-2 pl-3">
			<p className="font-heading font-medium text-sm">{title}</p>
			<p className="whitespace-pre-wrap break-words text-sm">{text}</p>
		</div>
	);
}
