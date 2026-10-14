import { currentUser } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { spyOnServerLog } from "../../testing/server-log-spy";
import { resolveStarterName } from "./resolve-starter-name";

vi.mock("@clerk/nextjs/server", () => ({ currentUser: vi.fn() }));

const currentUserMock = vi.mocked(currentUser) as unknown as ReturnType<
	typeof vi.fn
>;

describe("resolveStarterName", () => {
	beforeEach(() => {
		currentUserMock.mockReset();
	});

	it("returns the full name", async () => {
		currentUserMock.mockResolvedValue({
			fullName: "Ana Souza",
			primaryEmailAddress: { emailAddress: "ana@example.com" },
		});

		expect(await resolveStarterName()).toBe("Ana Souza");
	});

	it("falls back to the primary email without a full name", async () => {
		currentUserMock.mockResolvedValue({
			fullName: null,
			primaryEmailAddress: { emailAddress: "ana@example.com" },
		});

		expect(await resolveStarterName()).toBe("ana@example.com");
	});

	it("returns null when the user has neither", async () => {
		currentUserMock.mockResolvedValue({
			fullName: "",
			primaryEmailAddress: null,
		});

		expect(await resolveStarterName()).toBeNull();
	});

	it("returns null when there is no user", async () => {
		currentUserMock.mockResolvedValue(null);

		expect(await resolveStarterName()).toBeNull();
	});

	it("returns null and logs a warning when Clerk fails", async () => {
		const logged = spyOnServerLog();
		currentUserMock.mockRejectedValue(new TypeError("boom"));

		const name = await resolveStarterName();

		expect(name).toBeNull();
		expect(logged()).toEqual([
			expect.objectContaining({
				level: "warn",
				event: "auth.starter_name_unavailable",
				error: "TypeError",
			}),
		]);
	});
});
