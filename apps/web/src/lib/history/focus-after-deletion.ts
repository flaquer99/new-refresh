import { scanLinkPath } from "@/lib/scans/scan-links";

type DeletionFocus = {
	scanId: string;
	fallbackId: string;
};

const ENTRY_LINK_SELECTOR = "h2 a[href]";

const entryLink = (entry: Element | null | undefined): HTMLElement | null =>
	entry?.querySelector<HTMLElement>(ENTRY_LINK_SELECTOR) ?? null;

const deletedEntry = (scanId: string): Element | null =>
	document.querySelector(`a[href="${scanLinkPath(scanId)}"]`)?.closest("li") ??
	null;

export const focusAfterDeletion = ({ scanId, fallbackId }: DeletionFocus) => {
	const entry = deletedEntry(scanId);
	const target =
		entryLink(entry?.nextElementSibling) ??
		entryLink(entry?.previousElementSibling) ??
		document.getElementById(fallbackId);
	target?.focus();
};
