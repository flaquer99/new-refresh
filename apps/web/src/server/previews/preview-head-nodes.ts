import type { DefaultTreeAdapterMap } from "parse5";
import { defaultTreeAdapter, html } from "parse5";

type Element = DefaultTreeAdapterMap["element"];
type ParentNode = DefaultTreeAdapterMap["parentNode"];
type ChildNode = DefaultTreeAdapterMap["childNode"];

const REFRESH_PATTERN = /^\s*refresh\s*$/i;

export type HeadNodeParams = {
	finalUrl: string;
	script: string;
};

const attributeOf = (element: Element, name: string): string | undefined =>
	element.attrs.find((attribute) => attribute.name === name)?.value;

const createElement = (
	tagName: string,
	attrs: Record<string, string>,
): Element =>
	defaultTreeAdapter.createElement(
		tagName,
		html.NS.HTML,
		Object.entries(attrs).map(([name, value]) => ({ name, value })),
	);

const isPageBase = (node: ChildNode): boolean =>
	defaultTreeAdapter.isElementNode(node) && node.tagName === "base";

const isMetaRefresh = (node: ChildNode): boolean =>
	defaultTreeAdapter.isElementNode(node) &&
	node.tagName === "meta" &&
	REFRESH_PATTERN.test(attributeOf(node, "http-equiv") ?? "");

const shouldRemove = (node: ChildNode): boolean =>
	isPageBase(node) || isMetaRefresh(node);

export const removeNavigationHints = (parent: ParentNode): void => {
	for (const child of [...parent.childNodes]) {
		if (shouldRemove(child)) {
			defaultTreeAdapter.detachNode(child);
			continue;
		}
		if (defaultTreeAdapter.isElementNode(child)) {
			removeNavigationHints(child);
		}
	}
};

const isHead = (node: ChildNode): node is Element =>
	defaultTreeAdapter.isElementNode(node) && node.tagName === "head";

export const findHead = (document: ParentNode): Element | null => {
	const root = document.childNodes.find(defaultTreeAdapter.isElementNode);
	return root?.childNodes.find(isHead) ?? null;
};

export const buildHeadNodes = ({
	finalUrl,
	script,
}: HeadNodeParams): Element[] => {
	const scriptElement = createElement("script", {});
	defaultTreeAdapter.insertText(scriptElement, script);
	return [
		createElement("base", { href: finalUrl }),
		createElement("meta", { name: "referrer", content: "no-referrer" }),
		scriptElement,
	];
};

export const prependChildren = (
	parent: Element,
	nodes: readonly ChildNode[],
): void => {
	const first = parent.childNodes[0];
	for (const node of nodes) {
		if (first) {
			defaultTreeAdapter.insertBefore(parent, node, first);
			continue;
		}
		defaultTreeAdapter.appendChild(parent, node);
	}
};
