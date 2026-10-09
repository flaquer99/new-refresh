import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

const POSTGRES_IMAGE = "postgres:17-alpine";
const PACKAGE_DIR = fileURLToPath(new URL("../..", import.meta.url));
const PRISMA_BIN = fileURLToPath(
  new URL("../../node_modules/.bin/prisma", import.meta.url),
);

export type TestDatabase = {
  url: string;
  stop: () => Promise<void>;
};

export const applyMigrations = (databaseUrl: string): void => {
  execFileSync(PRISMA_BIN, ["migrate", "deploy"], {
    cwd: PACKAGE_DIR,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });
};

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  const url = container.getConnectionUri();
  applyMigrations(url);
  return {
    url,
    stop: async () => {
      await container.stop();
    },
  };
};
