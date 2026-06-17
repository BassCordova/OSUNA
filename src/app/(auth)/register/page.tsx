"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AuthCard, Input } from "@/components/AuthCard";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }
      // Iniciar sesión automáticamente
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) {
        router.replace("/login");
      } else {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setError("No se pudo crear la cuenta. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Crea tu cuenta" subtitle="Empieza a organizar el trabajo de tu equipo">
      <form onSubmit={submit} className="space-y-3">
        <Input label="Nombre" type="text" value={name} onChange={setName} autoFocus placeholder="Tu nombre" />
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@impressive.studio" />
        <Input label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Crear cuenta
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Inicia sesión</Link>
      </p>
    </AuthCard>
  );
}
