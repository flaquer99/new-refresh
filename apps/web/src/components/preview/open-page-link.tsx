const LINK_LABEL = "Open page in new tab";

type OpenPageLinkProps = {
	pageUrl: string;
};

export function OpenPageLink({ pageUrl }: OpenPageLinkProps) {
	return (
		<a
			className="rounded-sm text-link text-sm underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
			href={pageUrl}
			rel="noopener noreferrer"
			target="_blank"
		>
			{LINK_LABEL}
			<span className="sr-only"> (opens in a new tab)</span>
		</a>
	);
}
