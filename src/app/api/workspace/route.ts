import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { seedWorkspaceForUser, pickWorkspaceData } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → devuelve el grafo de trabajo del usuario (lo crea sembrado si no existe)
export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    let workspace = await prisma.workspace.findUnique({ where: { userId } });

    if (!workspace) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const data = seedWorkspaceForUser(user?.name ?? "Usuario", user?.email ?? "");
      workspace = await prisma.workspace.create({
        data: { userId, data: data as object },
      });
    }

    return NextResponse.json({ data: workspace.data, version: workspace.version, updatedAt: workspace.updatedAt });
  } catch (err) {
    console.error("[workspace GET] error:", err);
    return NextResponse.json({ error: "Error al cargar el workspace." }, { status: 500 });
  }
}

// PUT → guarda el grafo de trabajo completo
export async function PUT(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.data) {
      return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
    }

    // Solo persistimos las claves conocidas del grafo de trabajo
    const data = pickWorkspaceData(body.data);

    const saved = await prisma.workspace.upsert({
      where: { userId },
      update: { data: data as object, version: { increment: 1 } },
      create: { userId, data: data as object },
    });

    return NextResponse.json({ ok: true, version: saved.version, updatedAt: saved.updatedAt });
  } catch (err) {
    console.error("[workspace PUT] error:", err);
    return NextResponse.json({ error: "Error al guardar." }, { status: 500 });
  }
}
