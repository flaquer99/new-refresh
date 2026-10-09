import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import type { PrismaClient } from "./generated/prisma/client.js";
import { resultColumns } from "./result-columns.js";
import type { RecordOutcome } from "./scan-store-types.js";

export const RUNNING = "running";

export const scanExists = async (
  prisma: PrismaClient,
  scanId: string,
): Promise<boolean> => (await prisma.scan.count({ where: { id: scanId } })) > 0;

export const recordResult = async (
  prisma: PrismaClient,
  result: ScanResult,
): Promise<RecordOutcome> => {
  const { count } = await prisma.scan.updateMany({
    where: { id: result.scanId, status: RUNNING },
    data: resultColumns(result),
  });
  if (count === 1) {
    return "recorded";
  }
  return (await scanExists(prisma, result.scanId))
    ? "already-final"
    : "not-found";
};
