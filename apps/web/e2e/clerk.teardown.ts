import { test as teardown } from "@playwright/test";
import { destroyWorld } from "./support/clerk-world";

teardown("deletes the shared users and organizations", async () => {
	await destroyWorld();
});
