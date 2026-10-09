import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

function showModal(this: HTMLDialogElement): void {
	this.setAttribute("open", "");
}

function close(this: HTMLDialogElement): void {
	this.removeAttribute("open");
	this.dispatchEvent(new Event("close"));
}

if (!HTMLDialogElement.prototype.showModal) {
	HTMLDialogElement.prototype.showModal = showModal;
	HTMLDialogElement.prototype.close = close;
}

afterEach(() => {
	cleanup();
});
