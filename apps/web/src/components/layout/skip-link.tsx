export const MAIN_CONTENT_ID = "main-content";

export function SkipLink() {
	return (
		<a
			className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:border focus-visible:border-primary focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:font-medium focus-visible:text-foreground"
			href={`#${MAIN_CONTENT_ID}`}
		>
			Skip to main content
		</a>
	);
}
