import { createPrismaClient } from "../create-prisma-client.js";
import type { Scan } from "../generated/prisma/client.js";

export const readScanRow = async (
  databaseUrl: string,
  scanId: string,
): Promise<Scan | null> => {
  const prisma = createPrismaClient(databaseUrl);
  try {
    return await prisma.scan.findUnique({ where: { id: scanId } });
  } finally {
    await prisma.$disconnect();
  }
};
