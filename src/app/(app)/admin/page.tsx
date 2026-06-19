"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Users, Layers, Database, RotateCcw, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { GlobalRole, ID } from "@/lib/types";

const roleMeta: Record<GlobalRole, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#6b46e5", bg: "#f4f1fe" },
  member: { label: "Miembro", color: "#0369a1", bg: "#e0f2fe" },
  guest: { label: "Invitado", color: "#b45309", bg: "#fef3c7" },
  viewer: { label: "Solo lectura", color: "#64748b", bg: "#f1f5f9" },
};
const roles: GlobalRole[] = ["admin", "member", "guest", "viewer"];

export default function AdminPage() {
  const users = useStore((s) => s.users);
  const teams = useStore((s) => s.teams);
  const customFields = useStore((s) => s.customFields);
  const projects = useStore((s) => s.projects);
  const resetDemo = useStore((s) => s.resetDemo);
  const addUser = useStore((s) => s.addUser);
  const updateUser = useStore((s) => s.updateUser);
  const deleteUser = useStore((s) => s.deleteUser);
  const createTeam = useStore((s) => s.createTeam);
  const currentUserId = useStore((s) => s.currentUserId);
  const [tab, setTab] = useState<"users" | "teams" | "fields">("users");

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<ID | null>(null);
  const [addTeamOpen, setAddTeamOpen] = useState(false);

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

      <div className="mb-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-1">
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
        {tab === "users" && <Button variant="primary" size="sm" onClick={() => setAddUserOpen(true)}><Plus size={14} /> Añadir usuario</Button>}
        {tab === "teams" && <Button variant="primary" size="sm" onClick={() => setAddTeamOpen(true)}><Plus size={14} /> Nuevo equipo</Button>}
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
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="group border-b border-gray-50 last:border-0">
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
                  <td className="px-4 py-2.5">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value as GlobalRole })}
                      className="rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-sm font-medium hover:border-gray-200 focus:border-brand-400 focus:outline-none"
                      style={{ color: roleMeta[u.role].color }}
                    >
                      {roles.map((r) => <option key={r} value={r} style={{ color: "#111827" }}>{roleMeta[r].label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => updateUser(u.id, { active: !u.active })}
                      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-sm", u.active ? "text-green-600" : "text-gray-400")}
                      title="Clic para cambiar"
                    >
                      <span className={cn("h-2 w-2 rounded-full", u.active ? "bg-green-500" : "bg-gray-300")} /> {u.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditUser(u.id)} className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-600 group-hover:text-gray-400" title="Editar">
                        <Pencil size={15} />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => { if (confirm(`¿Eliminar a ${u.name}? Sus tareas quedarán sin asignar.`)) deleteUser(u.id); }}
                          className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-600 group-hover:text-gray-400"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
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
              <Link key={t.id} href={`/team/${t.id}`} className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-300">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: t.color }} />
                  <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                  <ArrowRight size={15} className="ml-auto text-gray-300 group-hover:text-brand-500" />
                </div>
                <p className="mt-1 text-sm text-gray-500">{t.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {memberUsers.map((u) => u && <Avatar key={u.id} user={u} size={26} className="ring-2 ring-white" />)}
                  </div>
                  <span className="text-xs text-gray-400">{teamProjects.length} proyectos</span>
                </div>
              </Link>
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

      <AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} onAdd={addUser} />
      <EditUserModal userId={editUser} onClose={() => setEditUser(null)} />
      <AddTeamModal open={addTeamOpen} onClose={() => setAddTeamOpen(false)} onAdd={createTeam} />
    </div>
  );
}

function AddUserModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: ReturnType<typeof useStore.getState>["addUser"] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<GlobalRole>("member");
  const [jobTitle, setJobTitle] = useState("");

  const reset = () => { setName(""); setEmail(""); setRole("member"); setJobTitle(""); };
  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title="Añadir usuario">
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim() && email.trim()) { onAdd({ name: name.trim(), email: email.trim(), role, jobTitle: jobTitle.trim() || undefined }); onClose(); reset(); } }}
        className="space-y-3 px-5 pb-5 pt-3"
      >
        <Labeled label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="modal-input" /></Labeled>
        <Labeled label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="modal-input" /></Labeled>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Cargo"><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="modal-input" /></Labeled>
          <Labeled label="Rol">
            <select value={role} onChange={(e) => setRole(e.target.value as GlobalRole)} className="modal-input">
              {roles.map((r) => <option key={r} value={r}>{roleMeta[r].label}</option>)}
            </select>
          </Labeled>
        </div>
        <p className="text-xs text-gray-400">Este usuario se añade al directorio del workspace para asignarle tareas. (No crea una cuenta de inicio de sesión.)</p>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => { onClose(); reset(); }}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || !email.trim()}>Añadir</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ userId, onClose }: { userId: ID | null; onClose: () => void }) {
  const user = useStore((s) => s.users.find((u) => u.id === userId));
  const updateUser = useStore((s) => s.updateUser);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");

  // sincroniza al abrir
  const [lastId, setLastId] = useState<ID | null>(null);
  if (user && user.id !== lastId) {
    setLastId(user.id);
    setName(user.name);
    setJobTitle(user.jobTitle ?? "");
    setDepartment(user.department ?? "");
  }
  if (!user) return null;

  return (
    <Modal open onClose={onClose} title="Editar usuario">
      <form
        onSubmit={(e) => { e.preventDefault(); updateUser(user.id, { name: name.trim() || user.name, jobTitle: jobTitle.trim() || undefined, department: department.trim() || undefined }); onClose(); }}
        className="space-y-3 px-5 pb-5 pt-3"
      >
        <Labeled label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="modal-input" /></Labeled>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Cargo"><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="modal-input" /></Labeled>
          <Labeled label="Departamento"><input value={department} onChange={(e) => setDepartment(e.target.value)} className="modal-input" /></Labeled>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddTeamModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: ReturnType<typeof useStore.getState>["createTeam"] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <Modal open={open} onClose={() => { onClose(); setName(""); setDescription(""); }} title="Nuevo equipo">
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onAdd({ name: name.trim(), description: description.trim() || undefined }); onClose(); setName(""); setDescription(""); } }}
        className="space-y-3 px-5 pb-5 pt-3"
      >
        <Labeled label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="modal-input" /></Labeled>
        <Labeled label="Descripción"><input value={description} onChange={(e) => setDescription(e.target.value)} className="modal-input" /></Labeled>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => { onClose(); setName(""); setDescription(""); }}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>Crear equipo</Button>
        </div>
      </form>
    </Modal>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}
