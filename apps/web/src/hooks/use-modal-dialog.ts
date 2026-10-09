import { useRef } from "react";

const INITIAL_FOCUS_SELECTOR = "[data-initial-focus]";

export function useModalDialog() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const open = () => {
		dialogRef.current?.showModal();
		dialogRef.current
			?.querySelector<HTMLElement>(INITIAL_FOCUS_SELECTOR)
			?.focus();
	};
	const close = () => {
		dialogRef.current?.close();
	};
	const restoreFocus = () => {
		triggerRef.current?.focus();
	};
	return { dialogRef, triggerRef, open, close, restoreFocus };
}
