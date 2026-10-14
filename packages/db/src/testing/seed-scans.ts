import { randomUUID } from "node:crypto";
import type { ScanStatusValue } from "@refresh/scan-contracts/scan-status";
import { createPrismaClient } from "../create-prisma-client.js";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { ScanOwner } from "../scan-store-types.js";
import { TEST_OWNER } from "./test-owner.js";

export type SeedScan = {
  scanId: string;
  startUrl: string;
  status: ScanStatusValue;
  startedAt: Date;
  owner?: ScanOwner;
};

export type SeedHistoryOptions = {
  count: number;
  newest: Date;
  stepMs: number;
  startUrl: string;
  owner?: ScanOwner;
};

const withPrisma = async (
  databaseUrl: string,
  work: (prisma: PrismaClient) => Promise<unknown>,
): Promise<void> => {
  const prisma = createPrismaClient(databaseUrl);
  try {
    await work(prisma);
  } finally {
    await prisma.$disconnect();
  }
};

export const buildSeedHistory = ({
  count,
  newest,
  stepMs,
  startUrl,
  owner,
}: SeedHistoryOptions): SeedScan[] =>
  Array.from({ length: count }, (_, index) => ({
    scanId: randomUUID(),
    startUrl,
    status: "completed",
    startedAt: new Date(newest.getTime() - index * stepMs),
    owner,
  }));

export const seedScans = (
  databaseUrl: string,
  scans: readonly SeedScan[],
): Promise<void> =>
  withPrisma(databaseUrl, (prisma) =>
    prisma.scan.createMany({
      data: scans.map(({ scanId, startUrl, status, startedAt, owner }) => ({
        ...(owner ?? TEST_OWNER),
        id: scanId,
        startUrl,
        depth: 0,
        status,
        startedAt,
        finishedAt: status === "running" ? null : startedAt,
      })),
    }),
  );

export const deleteScans = (
  databaseUrl: string,
  scanIds: readonly string[],
): Promise<void> =>
  withPrisma(databaseUrl, (prisma) =>
    prisma.scan.deleteMany({ where: { id: { in: [...scanIds] } } }),
  );

export const resetScans = (databaseUrl: string): Promise<void> =>
  withPrisma(
    databaseUrl,
    (prisma) => prisma.$executeRaw`TRUNCATE TABLE "scans"`,
  );

export const explainQuery = async (
  databaseUrl: string,
  sql: string,
): Promise<string> => {
  const prisma = createPrismaClient(databaseUrl);
  try {
    const rows = await prisma.$queryRawUnsafe<{ "QUERY PLAN": string }[]>(
      `EXPLAIN ${sql}`,
    );
    return rows.map((row) => row["QUERY PLAN"]).join("\n");
  } finally {
    await prisma.$disconnect();
  }
};
