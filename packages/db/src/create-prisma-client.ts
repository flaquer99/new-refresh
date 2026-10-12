import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const POOL_MAX_CONNECTIONS = 10;
const CONNECTION_TIMEOUT_MS = 5000;

export const createPrismaClient = (databaseUrl: string): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
      max: POOL_MAX_CONNECTIONS,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    }),
  });
