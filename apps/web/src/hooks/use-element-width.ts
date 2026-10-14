import { useEffect, useState } from "react";

export function useElementWidth<T extends Element>() {
	const [element, setElement] = useState<T | null>(null);
	const [width, setWidth] = useState(0);
	useEffect(() => {
		if (!element) {
			return;
		}
		setWidth(element.getBoundingClientRect().width);
		const observer = new ResizeObserver(([entry]) => {
			if (entry) {
				setWidth(entry.contentRect.width);
			}
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, [element]);
	return { ref: setElement, width };
}
