import { useFocusOnMount } from "@/hooks/use-focus-on-mount";

type ScanFormHeadingProps = {
	id: string;
	focusOnMount: boolean;
};

export function ScanFormHeading({ id, focusOnMount }: ScanFormHeadingProps) {
	const headingRef = useFocusOnMount<HTMLHeadingElement>(focusOnMount);
	return (
		<h2
			className="font-semibold text-xl"
			id={id}
			ref={headingRef}
			tabIndex={-1}
		>
			Scan a website
		</h2>
	);
}
