// Sincroniza el esquema con la base de datos durante el build de Vercel.
// Si DATABASE_URL no está configurada (o la conexión falla) NO rompe el build:
// el frontend se despliega igual y las APIs avisarán hasta configurar la DB.
import { execSync } from "node:child_process";

// Acepta cualquiera de los nombres que usan las integraciones de Postgres de Vercel
// (Vercel Postgres / Neon / Supabase) para no depender de configurar DATABASE_URL a mano.
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

if (url) process.env.DATABASE_URL = url;

if (!url) {
  console.warn(
    "\n[db-setup] ⚠ DATABASE_URL no está configurada. Se omite la creación de tablas.\n" +
    "           Agrega una base de datos PostgreSQL (Neon / Vercel Postgres) y vuelve a desplegar.\n"
  );
  process.exit(0);
}

try {
  console.log("[db-setup] Sincronizando esquema con la base de datos (prisma db push)…");
  execSync("prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
  console.log("[db-setup] ✓ Esquema sincronizado.");
} catch (err) {
  console.warn(
    "\n[db-setup] ⚠ No se pudo sincronizar el esquema con la base de datos.\n" +
    "           Verifica DATABASE_URL. El build continúa; las APIs fallarán hasta resolverlo.\n"
  );
  // No rompemos el build para no bloquear el despliegue del frontend.
}
