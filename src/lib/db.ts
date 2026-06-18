import { PrismaClient } from "@prisma/client";

// Acepta cualquiera de los nombres que inyectan las integraciones de Postgres de Vercel
// (Vercel Postgres / Neon / Supabase). Si DATABASE_URL no está, usa el primero disponible.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    "";
}

// Singleton para no agotar conexiones en serverless / hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
