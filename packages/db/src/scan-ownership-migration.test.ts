import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, inject, it } from "vitest";
import { createPrismaClient } from "./create-prisma-client.js";
import { DATABASE_URL_KEY } from "./testing/provided-context.js";

type Client = ReturnType<typeof createPrismaClient>;

const MIGRATIONS_DIR = fileURLToPath(
  new URL("../prisma/migrations/", import.meta.url),
);
const LEGACY_DATABASE = "legacy_ownership";
const LEGACY_ID = "11111111-1111-4111-8111-111111111111";
const NEW_ID = "22222222-2222-4222-8222-222222222222";
const STATEMENT_SEPARATOR = ";\n";

const migrationStatements = (suffix: string): string[] => {
  const name = readdirSync(MIGRATIONS_DIR).find((entry) =>
    entry.endsWith(suffix),
  );
  const sql = readFileSync(`${MIGRATIONS_DIR}${name}/migration.sql`, "utf8");
  return sql
    .split(STATEMENT_SEPARATOR)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
};

const databaseUrl = (database: string): string => {
  const url = new URL(inject(DATABASE_URL_KEY));
  url.pathname = `/${database}`;
  return url.toString();
};

const insertScan = (client: Client, id: string) =>
  client.$executeRawUnsafe(
    `INSERT INTO scans (id, start_url, depth, status, started_at, updated_at) VALUES ('${id}', 'https://legacy.example.org', 0, 'completed', now(), now())`,
  );

const createLegacyClient = async (): Promise<Client> => {
  const admin = createPrismaClient(inject(DATABASE_URL_KEY));
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${LEGACY_DATABASE}`);
  await admin.$executeRawUnsafe(`CREATE DATABASE ${LEGACY_DATABASE}`);
  await admin.$disconnect();
  const legacy = createPrismaClient(databaseUrl(LEGACY_DATABASE));
  for (const statement of migrationStatements("_init")) {
    await legacy.$executeRawUnsafe(statement);
  }
  await insertScan(legacy, LEGACY_ID);
  return legacy;
};

const applyOwnershipMigration = async (client: Client) => {
  for (const statement of migrationStatements("_scan_ownership")) {
    await client.$executeRawUnsafe(statement);
  }
};

describe("scan ownership migration", () => {
  it("deletes legacy unowned scans", async () => {
    // GIVEN
    const legacy = await createLegacyClient();

    // WHEN
    await applyOwnershipMigration(legacy);

    // THEN
    const remaining = await legacy.scan.count();
    await legacy.$disconnect();
    expect(remaining).toBe(0);
  });

  it("rejects scans inserted without an organization", async () => {
    // GIVEN
    const legacy = await createLegacyClient();
    await applyOwnershipMigration(legacy);

    // WHEN
    const insert = insertScan(legacy, NEW_ID);

    // THEN
    await expect(insert).rejects.toThrow(/organization_id/);
    await legacy.$disconnect();
  });
});
