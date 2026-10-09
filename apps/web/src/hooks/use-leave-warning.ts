import { useEffect } from "react";

const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
	event.preventDefault();
};

export function useLeaveWarning(active: boolean) {
	useEffect(() => {
		if (!active) {
			return;
		}
		window.addEventListener("beforeunload", warnBeforeLeaving);
		return () => {
			window.removeEventListener("beforeunload", warnBeforeLeaving);
		};
	}, [active]);
}
