import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { inviteMemberAction } from "@/app/organization/actions";
import {
	INITIAL_INVITE_STATE,
	inviteErrorState,
} from "@/lib/organizations/invite-member-state";
import { InviteMemberForm } from "./invite-member-form";

vi.mock("@/app/organization/actions", () => ({ inviteMemberAction: vi.fn() }));

const FIELD_ERROR = "ana@client.com already belongs to another organization.";

const submitInvite = async () => {
	const user = userEvent.setup();
	render(<InviteMemberForm />);
	await user.type(screen.getByLabelText("Email address"), "ana@client.com");
	await user.click(screen.getByRole("button", { name: "Send invitation" }));
};

describe("InviteMemberForm", () => {
	it("links the field error to the email input and announces it", async () => {
		// GIVEN
		vi.mocked(inviteMemberAction).mockResolvedValue(
			inviteErrorState({ fieldError: FIELD_ERROR }),
		);

		// WHEN
		await submitInvite();

		// THEN
		const alert = await screen.findByRole("alert");
		const input = screen.getByLabelText("Email address");
		expect(alert.textContent).toBe(FIELD_ERROR);
		expect(input.getAttribute("aria-describedby")).toBe(alert.id);
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("announces a form error", async () => {
		// GIVEN
		vi.mocked(inviteMemberAction).mockResolvedValue(
			inviteErrorState({ formError: "Try again in a minute." }),
		);

		// WHEN
		await submitInvite();

		// THEN
		expect((await screen.findByRole("alert")).textContent).toBe(
			"Try again in a minute.",
		);
	});

	it("confirms a sent invitation", async () => {
		// GIVEN
		vi.mocked(inviteMemberAction).mockResolvedValue({
			...INITIAL_INVITE_STATE,
			status: "sent",
			email: "ana@client.com",
		});

		// WHEN
		await submitInvite();

		// THEN
		expect((await screen.findByRole("status")).textContent).toBe(
			"Invitation sent to ana@client.com.",
		);
	});

	it("offers member and admin roles with member selected", () => {
		// GIVEN / WHEN
		render(<InviteMemberForm />);

		// THEN
		const select = screen.getByLabelText("Role") as HTMLSelectElement;
		expect(select.value).toBe("org:member");
		expect(Array.from(select.options).map((option) => option.value)).toEqual([
			"org:member",
			"org:admin",
		]);
	});
});
