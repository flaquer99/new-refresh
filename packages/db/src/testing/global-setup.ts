import type { TestProject } from "vitest/node";
import { DATABASE_URL_KEY } from "./provided-context.js";
import { startTestDatabase } from "./test-database.js";

export default async function setup(project: TestProject) {
  const database = await startTestDatabase();
  project.provide(DATABASE_URL_KEY, database.url);
  return database.stop;
}
