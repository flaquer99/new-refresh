import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (!window.matchMedia) {
	window.matchMedia = (query: string): MediaQueryList =>
		({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			addListener: () => undefined,
			removeListener: () => undefined,
			dispatchEvent: () => false,
		}) as MediaQueryList;
}

afterEach(() => {
	cleanup();
});

if (!window.ResizeObserver) {
	window.ResizeObserver = class {
		observe = () => undefined;
		unobserve = () => undefined;
		disconnect = () => undefined;
	};
}
