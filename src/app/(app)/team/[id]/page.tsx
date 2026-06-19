"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Hash, Plus, Pencil, Trash2, X, UserPlus, ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "@/components/Avatar";
import { Button, Modal, EmptyState } from "@/components/ui";
import { progressOf, healthMeta, cn } from "@/lib/utils";
import type { TeamPrivacy } from "@/lib/types";

const privacyLabel: Record<TeamPrivacy, string> = {
  public: "Público en la organización",
  request: "Por solicitud",
  private: "Privado",
};

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const team = useStore((s) => s.teams.find((t) => t.id === id));
  const teamsCount = useStore((s) => s.teams.length);
  const projects = useStore((s) => s.projects);
  const users = useStore((s) => s.users);
  const tasksOf = useStore((s) => s.tasksOf);
  const userById = useStore((s) => s.userById);
  const deleteTeam = useStore((s) => s.deleteTeam);
  const addTeamMember = useStore((s) => s.addTeamMember);
  const removeTeamMember = useStore((s) => s.removeTeamMember);
  const openQuickCreate = useUI((s) => s.openQuickCreate);

  const [editOpen, setEditOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  if (!team) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Equipo no encontrado.</p>
          <button onClick={() => router.push("/")} className="mt-2 text-sm font-medium text-brand-600">Volver al inicio</button>
        </div>
      </div>
    );
  }

  const teamProjects = projects.filter((p) => p.teamId === team.id && p.status !== "archived");
  const archived = projects.filter((p) => p.teamId === team.id && p.status === "archived");
  const members = team.memberIds.map((mid) => userById(mid)).filter(Boolean);
  const nonMembers = users.filter((u) => !team.memberIds.includes(u.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: team.color + "22" }}>
            <Users size={22} style={{ color: team.color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-500">{team.description || privacyLabel[team.privacy]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEditOpen(true)}><Pencil size={14} /> Editar</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (teamsCount <= 1) { alert("No puedes eliminar el único equipo. Crea otro primero."); return; }
              if (confirm(`¿Eliminar el equipo "${team.name}"? Sus proyectos se moverán a otro equipo.`)) { deleteTeam(team.id); router.push("/"); }
            }}
          >
            <Trash2 size={14} /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Proyectos */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Proyectos ({teamProjects.length})</h2>
            <Button size="sm" variant="primary" onClick={() => openQuickCreate("project")}><Plus size={14} /> Nuevo proyecto</Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {teamProjects.length === 0 ? (
              <EmptyState icon={<Hash size={32} />} title="Sin proyectos" hint="Crea el primer proyecto de este equipo." />
            ) : (
              teamProjects.map((p) => {
                const pt = tasksOf(p.id);
                const progress = progressOf(pt);
                const health = p.statusUpdates[0]?.health;
                return (
                  <Link key={p.id} href={`/project/${p.id}`} className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: p.color + "1a" }}>
                      <Hash size={16} style={{ color: p.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-800">{p.name}</span>
                        {health && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: healthMeta[health].dot }} />}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }} />
                        </div>
                        <span className="text-xs text-gray-400">{progress}%</span>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-gray-300" />
                  </Link>
                );
              })
            )}
          </div>
          {archived.length > 0 && (
            <div className="mt-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Archivados ({archived.length})</h3>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {archived.map((p) => (
                  <Link key={p.id} href={`/project/${p.id}`} className="flex items-center gap-2 border-b border-gray-50 px-4 py-2 text-sm text-gray-500 last:border-0 hover:bg-gray-50">
                    <Hash size={14} style={{ color: p.color }} /> {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Miembros */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Miembros ({members.length})</h2>
            {nonMembers.length > 0 && (
              <button onClick={() => setAddingMember((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                <UserPlus size={13} /> Añadir
              </button>
            )}
          </div>
          {addingMember && nonMembers.length > 0 && (
            <select
              autoFocus
              onChange={(e) => { if (e.target.value) addTeamMember(team.id, e.target.value); setAddingMember(false); }}
              onBlur={() => setAddingMember(false)}
              className="mb-2 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
            >
              <option value="">Selecciona persona…</option>
              {nonMembers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {members.map((u) => u && (
              <div key={u.id} className="group flex items-center gap-2.5 border-b border-gray-50 px-3 py-2 last:border-0">
                <Avatar user={u} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800">{u.name}</div>
                  <div className="truncate text-xs text-gray-400">{u.jobTitle ?? u.email}</div>
                </div>
                <button onClick={() => removeTeamMember(team.id, u.id)} title="Quitar del equipo" className="rounded p-1 text-gray-300 opacity-0 hover:bg-gray-100 hover:text-red-500 group-hover:opacity-100">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditTeamModal open={editOpen} onClose={() => setEditOpen(false)} teamId={team.id} />
    </div>
  );
}

const teamPalette = ["#6b46e5", "#e5466b", "#46a5e5", "#2bb673", "#f59e0b", "#8b5cf6", "#0ea5e9", "#ec4899"];

function EditTeamModal({ open, onClose, teamId }: { open: boolean; onClose: () => void; teamId: string }) {
  const team = useStore((s) => s.teams.find((t) => t.id === teamId));
  const updateTeam = useStore((s) => s.updateTeam);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [privacy, setPrivacy] = useState<TeamPrivacy>("public");
  const [lastId, setLastId] = useState<string | null>(null);

  if (team && open && team.id !== lastId) {
    setLastId(team.id);
    setName(team.name);
    setDescription(team.description ?? "");
    setColor(team.color);
    setPrivacy(team.privacy);
  }
  if (!team) return null;

  return (
    <Modal open={open} onClose={() => { onClose(); setLastId(null); }} title="Editar equipo">
      <form
        onSubmit={(e) => { e.preventDefault(); updateTeam(team.id, { name: name.trim() || team.name, description: description.trim() || undefined, color, privacy }); onClose(); setLastId(null); }}
        className="space-y-3 px-5 pb-5 pt-3"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="modal-input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Descripción</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="modal-input" />
        </label>
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">Color</span>
          <div className="flex gap-1.5">
            {teamPalette.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={cn("h-7 w-7 rounded-full", color === c && "ring-2 ring-offset-2 ring-gray-400")} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Privacidad</span>
          <select value={privacy} onChange={(e) => setPrivacy(e.target.value as TeamPrivacy)} className="modal-input">
            <option value="public">Público en la organización</option>
            <option value="request">Por solicitud</option>
            <option value="private">Privado</option>
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => { onClose(); setLastId(null); }}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}
