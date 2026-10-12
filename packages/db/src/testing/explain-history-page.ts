import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { listScans } from "../scan-history-query.js";
import type { HistoryPageRequest } from "../scan-store-types.js";

type CapturedQuery = { query: string; params: string };

const createLoggingClient = (databaseUrl: string) =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
    log: [{ emit: "event", level: "query" }],
  });

export const explainHistoryPage = async (
  databaseUrl: string,
  page: HistoryPageRequest,
): Promise<string> => {
  const prisma = createLoggingClient(databaseUrl);
  const captured: CapturedQuery[] = [];
  prisma.$on("query", ({ query, params }) => {
    captured.push({ query, params });
  });
  try {
    await listScans(prisma, page);
    const [listQuery] = captured;
    if (listQuery === undefined) {
      throw new Error("listScans did not run a query");
    }
    const params = JSON.parse(listQuery.params) as unknown[];
    const rows = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL enable_seqscan = off");
      return await tx.$queryRawUnsafe<{ "QUERY PLAN": string }[]>(
        `EXPLAIN ${listQuery.query}`,
        ...params,
      );
    });
    return rows.map((row) => row["QUERY PLAN"]).join("\n");
  } finally {
    await prisma.$disconnect();
  }
};
