import { startTestDatabase } from "@refresh/db/testing/test-database";
import type { TestProject } from "vitest/node";
import { DATABASE_URL_KEY } from "./database-url-key";

export default async function setup(project: TestProject) {
	const database = await startTestDatabase();
	project.provide(DATABASE_URL_KEY, database.url);
	return database.stop;
}
