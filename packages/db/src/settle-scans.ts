import type { PrismaClient } from "./generated/prisma/client.js";
import { RUNNING, scanExists } from "./record-result.js";
import { interruptedColumns } from "./result-columns.js";
import type { DeleteOutcome } from "./scan-store-types.js";

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
  scanId: string,
): Promise<DeleteOutcome> => {
  const { count } = await prisma.scan.deleteMany({
    where: { id: scanId, status: { not: RUNNING } },
  });
  if (count === 1) {
    return "deleted";
  }
  return (await scanExists(prisma, scanId)) ? "running" : "not-found";
};

export const discardRunning = async (
  prisma: PrismaClient,
  scanId: string,
): Promise<void> => {
  await prisma.scan.deleteMany({ where: { id: scanId, status: RUNNING } });
};
