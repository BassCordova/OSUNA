"use client";

import { useState } from "react";
import { Settings, Users, Layers, Database, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { GlobalRole } from "@/lib/types";

const roleMeta: Record<GlobalRole, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#6b46e5", bg: "#f4f1fe" },
  member: { label: "Miembro", color: "#0369a1", bg: "#e0f2fe" },
  guest: { label: "Invitado", color: "#b45309", bg: "#fef3c7" },
  viewer: { label: "Solo lectura", color: "#64748b", bg: "#f1f5f9" },
};

export default function AdminPage() {
  const users = useStore((s) => s.users);
  const teams = useStore((s) => s.teams);
  const customFields = useStore((s) => s.customFields);
  const projects = useStore((s) => s.projects);
  const resetDemo = useStore((s) => s.resetDemo);
  const [tab, setTab] = useState<"users" | "teams" | "fields">("users");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={22} className="text-gray-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Administración</h1>
            <p className="text-sm text-gray-500">Usuarios, equipos y biblioteca de campos</p>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => { if (confirm("¿Restaurar todos los datos de demostración? Se perderán los cambios.")) resetDemo(); }}>
          <RotateCcw size={14} /> Restaurar demo
        </Button>
      </div>

      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {([["users", "Usuarios", Users], ["teams", "Equipos", Layers], ["fields", "Campos personalizados", Database]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn("flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium", tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-4 py-2">Usuario</th>
                <th className="hidden px-4 py-2 sm:table-cell">Cargo</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={u} size={32} />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-2.5 text-sm text-gray-600 sm:table-cell">{u.jobTitle ?? "—"}</td>
                  <td className="px-4 py-2.5"><Badge color={roleMeta[u.role].color} bg={roleMeta[u.role].bg}>{roleMeta[u.role].label}</Badge></td>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex items-center gap-1.5 text-sm", u.active ? "text-green-600" : "text-gray-400")}>
                      <span className={cn("h-2 w-2 rounded-full", u.active ? "bg-green-500" : "bg-gray-300")} /> {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "teams" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {teams.map((t) => {
            const memberUsers = t.memberIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);
            const teamProjects = projects.filter((p) => p.teamId === t.id);
            return (
              <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: t.color }} />
                  <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">{t.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {memberUsers.map((u) => u && <Avatar key={u.id} user={u} size={26} className="ring-2 ring-white" />)}
                  </div>
                  <span className="text-xs text-gray-400">{teamProjects.length} proyectos</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "fields" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-4 py-2">Campo</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {customFields.map((cf) => (
                <tr key={cf.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{cf.name}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{cf.type}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {cf.options?.map((o) => (
                        <span key={o.id} className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: o.color + "22", color: o.color }}>{o.label}</span>
                      )) ?? <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
