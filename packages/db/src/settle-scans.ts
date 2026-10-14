import type { PrismaClient } from "./generated/prisma/client.js";
import { RUNNING } from "./record-result.js";
import { interruptedColumns } from "./result-columns.js";
import type { DeleteOutcome, ScanKey } from "./scan-store-types.js";

type StaleWindow = { cutoff: Date; finishedAt: Date };

type Interruption = { scanId: string; finishedAt: Date };

export const settleStale = async (
  prisma: PrismaClient,
  { cutoff, finishedAt }: StaleWindow,
): Promise<number> => {
  const { count } = await prisma.scan.updateMany({
    where: { status: RUNNING, startedAt: { lt: cutoff } },
    data: interruptedColumns(finishedAt),
  });
  return count;
};

export const markInterrupted = async (
  prisma: PrismaClient,
  { scanId, finishedAt }: Interruption,
): Promise<boolean> => {
  const { count } = await prisma.scan.updateMany({
    where: { id: scanId, status: RUNNING },
    data: interruptedColumns(finishedAt),
  });
  return count === 1;
};

export const deleteFinished = async (
  prisma: PrismaClient,
  { scanId, organizationId }: ScanKey,
): Promise<DeleteOutcome> => {
  const { count } = await prisma.scan.deleteMany({
    where: { id: scanId, organizationId, status: { not: RUNNING } },
  });
  if (count === 1) {
    return "deleted";
  }
  const owned = await prisma.scan.count({
    where: { id: scanId, organizationId },
  });
  return owned > 0 ? "running" : "not-found";
};

export const deleteByOrganization = async (
  prisma: PrismaClient,
  organizationId: string,
): Promise<number> => {
  const { count } = await prisma.scan.deleteMany({ where: { organizationId } });
  return count;
};

export const discardRunning = async (
  prisma: PrismaClient,
  scanId: string,
): Promise<void> => {
  await prisma.scan.deleteMany({ where: { id: scanId, status: RUNNING } });
};
