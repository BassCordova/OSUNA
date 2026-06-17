import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { seedWorkspaceForUser } from "@/lib/workspace";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name ?? "").toString().trim();
    const email = (body.email ?? "").toString().toLowerCase().trim();
    const password = (body.password ?? "").toString();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const data = seedWorkspaceForUser(name, email);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        workspace: { create: { data: data as object } },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta. Verifica que la base de datos esté configurada." },
      { status: 500 }
    );
  }
}
