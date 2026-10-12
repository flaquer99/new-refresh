import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig } from "prisma/config";

const LOCAL_ENV_FILE = ".env";

const loadLocalEnv = () => {
  if (!existsSync(LOCAL_ENV_FILE)) {
    return;
  }
  const values = parseEnv(readFileSync(LOCAL_ENV_FILE, "utf8"));
  for (const [key, value] of Object.entries(values)) {
    process.env[key] ??= value;
  }
};

loadLocalEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
