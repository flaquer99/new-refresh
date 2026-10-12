type CodeBlockProps = {
	code: string;
	label: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
	return (
		<figure
			aria-label={label}
			className="max-w-full overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard focusable
			tabIndex={0}
		>
			<pre>
				<code>{code}</code>
			</pre>
		</figure>
	);
}
