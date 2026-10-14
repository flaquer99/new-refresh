import { parse } from "parse5";
import { describe, expect, it } from "vitest";
import { buildPreviewDocument } from "./build-preview-document";

const PARAMS = {
	finalUrl: "https://www.example.org/final/",
	selector: "main > img",
	token: "token-1",
};

const headTags = (html: string): string[] => {
	const document = parse(html);
	const root = document.childNodes.find((node) => "tagName" in node);
	const head = root && "childNodes" in root ? root.childNodes[0] : null;
	return head && "childNodes" in head
		? head.childNodes
				.filter((node) => "tagName" in node)
				.map((node) => ("tagName" in node ? node.tagName : ""))
		: [];
};

const FULL_PAGE =
	'<!DOCTYPE html><html><head><title>t</title><script src="/a.js"></script></head><body><p>hi</p></body></html>';

describe("buildPreviewDocument", () => {
	it("puts base, referrer meta, and the runtime script first in head", () => {
		// GIVEN
		const html = FULL_PAGE;

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(headTags(output)).toEqual([
			"base",
			"meta",
			"script",
			"title",
			"script",
		]);
	});

	it("sets the base href to the final url and the referrer policy", () => {
		// GIVEN
		const html = FULL_PAGE;

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(output).toContain(
			'<base href="https://www.example.org/final/"><meta name="referrer" content="no-referrer">',
		);
	});

	it("embeds the selector and token in the runtime script", () => {
		// GIVEN
		const html = FULL_PAGE;

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect([
			output.includes('"main \\u003e img"'),
			output.includes('"token-1"'),
		]).toEqual([true, true]);
	});

	it("keeps the doctype", () => {
		// GIVEN
		const html = FULL_PAGE;

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(output.startsWith("<!DOCTYPE html>")).toBe(true);
	});

	it("removes the page's own base element", () => {
		// GIVEN
		const html =
			'<html><head><base href="https://evil.test/"></head><body></body></html>';

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(output).not.toContain("evil.test");
	});

	it("removes a meta refresh in any case", () => {
		// GIVEN
		const html =
			'<html><head><META HTTP-EQUIV="Refresh" content="0;url=/x"></head><body></body></html>';

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(output).not.toContain("url=/x");
	});

	it("keeps other meta elements", () => {
		// GIVEN
		const html =
			'<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="5"></head></html>';

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(output).toContain('<meta charset="utf-8">');
	});

	it("builds a head for a fragment without html or head", () => {
		// GIVEN
		const html = "<p>just a fragment</p>";

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(headTags(output)).toEqual(["base", "meta", "script"]);
	});

	it("keeps the fragment content in the body", () => {
		// GIVEN
		const html = "<p>just a fragment</p>";

		// WHEN
		const output = buildPreviewDocument(html, PARAMS);

		// THEN
		expect(output).toContain("<body><p>just a fragment</p></body>");
	});
});
