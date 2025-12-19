import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Modify connection string to disable SSL verification
const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL || "")
  .replace("sslmode=require", "sslmode=no-verify");

// Create connection pool with SSL configuration
const pool = globalForPrisma.pool ?? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

// Create adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

