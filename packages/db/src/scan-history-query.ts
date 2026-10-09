import type { Prisma, PrismaClient } from "./generated/prisma/client.js";
import {
  decodeCursor,
  encodeCursor,
  type HistoryCursor,
} from "./history-cursor.js";
import { toHistoryEntry } from "./scan-row-mapping.js";
import type {
  HistoryPageRequest,
  ScanHistoryPage,
} from "./scan-store-types.js";

const NEWEST_FIRST = [
  { startedAt: "desc" },
  { id: "desc" },
] satisfies Prisma.ScanOrderByWithRelationInput[];

const olderThan = (cursor: HistoryCursor | null): Prisma.ScanWhereInput => {
  if (cursor === null) {
    return {};
  }
  return {
    OR: [
      { startedAt: { lt: cursor.startedAt } },
      { startedAt: cursor.startedAt, id: { lt: cursor.id } },
    ],
  };
};

export const listScans = async (
  prisma: PrismaClient,
  { before, limit }: HistoryPageRequest,
): Promise<ScanHistoryPage> => {
  const cursor = before === null ? null : decodeCursor(before);
  const rows = await prisma.scan.findMany({
    where: olderThan(cursor),
    orderBy: NEWEST_FIRST,
    take: limit + 1,
    omit: { report: true },
  });
  const entries = rows.slice(0, limit);
  const last = entries.at(-1);
  return {
    entries: entries.map(toHistoryEntry),
    nextBefore: last && rows.length > limit ? encodeCursor(last) : null,
  };
};
