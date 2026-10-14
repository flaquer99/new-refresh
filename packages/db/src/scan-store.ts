import { z } from "zod";
import { createPrismaClient } from "./create-prisma-client.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { recordResult } from "./record-result.js";
import { listScans } from "./scan-history-query.js";
import { toStoredScan } from "./scan-row-mapping.js";
import type {
  CreateRunningInput,
  ScanKey,
  ScanStore,
  ScanStoreOptions,
  StoredScan,
  UnreadableReportHandler,
} from "./scan-store-types.js";
import {
  deleteByOrganization,
  deleteFinished,
  discardRunning,
  markInterrupted,
  settleStale,
} from "./settle-scans.js";

const ScanIdSchema = z.uuid();

const isScanId = (value: string): boolean =>
  ScanIdSchema.safeParse(value).success;

const createRunning = async (
  prisma: PrismaClient,
  { scanId, request, startedAt, owner }: CreateRunningInput,
): Promise<void> => {
  await prisma.scan.create({
    data: {
      id: scanId,
      startUrl: request.url,
      depth: request.depth,
      status: "running",
      startedAt,
      ...owner,
    },
  });
};

const getScan = async (
  prisma: PrismaClient,
  { scanId, organizationId }: ScanKey,
  onUnreadableReport?: UnreadableReportHandler,
): Promise<StoredScan | null> => {
  if (!isScanId(scanId)) {
    return null;
  }
  const row = await prisma.scan.findFirst({
    where: { id: scanId, organizationId },
  });
  return row === null ? null : toStoredScan(row, onUnreadableReport);
};

export const createScanStore = ({
  databaseUrl,
  onUnreadableReport,
}: ScanStoreOptions): ScanStore => {
  const prisma = createPrismaClient(databaseUrl);
  return {
    createRunning: (input) => createRunning(prisma, input),
    discard: async (scanId) =>
      isScanId(scanId) ? await discardRunning(prisma, scanId) : undefined,
    recordResult: (result) => recordResult(prisma, result),
    get: (key) => getScan(prisma, key, onUnreadableReport),
    list: (page) => listScans(prisma, page),
    settleStale: (cutoff, finishedAt) =>
      settleStale(prisma, { cutoff, finishedAt }),
    markInterrupted: async (scanId, finishedAt) =>
      isScanId(scanId) &&
      (await markInterrupted(prisma, { scanId, finishedAt })),
    deleteFinished: async (key) =>
      isScanId(key.scanId) ? await deleteFinished(prisma, key) : "not-found",
    deleteByOrganization: (organizationId) =>
      deleteByOrganization(prisma, organizationId),
    close: () => prisma.$disconnect(),
  };
};
