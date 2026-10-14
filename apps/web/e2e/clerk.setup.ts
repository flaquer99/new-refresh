import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import { createWorld } from "./support/clerk-world";

setup("prepares the Clerk testing token and the shared users", async () => {
	await clerkSetup();
	await createWorld();
});
