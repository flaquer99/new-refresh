import type { ScanReport } from "@refresh/scan-contracts/report";
import { createPrismaClient } from "../create-prisma-client.js";
import { resultColumns } from "../result-columns.js";

export type SeedReportScan = {
  scanId: string;
  report: ScanReport;
};

export const seedReportScan = async (
  databaseUrl: string,
  { scanId, report }: SeedReportScan,
): Promise<void> => {
  const prisma = createPrismaClient(databaseUrl);
  try {
    await prisma.scan.create({
      data: {
        id: scanId,
        startUrl: report.startUrl,
        depth: report.depth,
        status: "running",
        startedAt: new Date(report.startedAt),
      },
    });
    await prisma.scan.update({
      where: { id: scanId },
      data: resultColumns({
        scanId,
        status: "completed",
        report,
        error: null,
        finishedAt: report.finishedAt,
      }),
    });
  } finally {
    await prisma.$disconnect();
  }
};
