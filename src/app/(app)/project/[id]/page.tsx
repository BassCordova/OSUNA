"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  List, Kanban, Calendar, GanttChartSquare, LayoutDashboard, Star,
  Filter, Users, Flag, CheckCircle2, X, MoreHorizontal, Pencil, Archive, Trash2, Settings2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ListView } from "@/components/views/ListView";
import { BoardView } from "@/components/views/BoardView";
import { CalendarView } from "@/components/views/CalendarView";
import { TimelineView } from "@/components/views/TimelineView";
import { DashboardView } from "@/components/views/DashboardView";
import { Avatar } from "@/components/Avatar";
import { Modal, Button } from "@/components/ui";
import { cn, healthMeta, progressOf } from "@/lib/utils";
import type { ProjectView, Task, HealthColor } from "@/lib/types";

const viewTabs: { key: ProjectView; label: string; icon: typeof List }[] = [
  { key: "list", label: "Lista", icon: List },
  { key: "board", label: "Tablero", icon: Kanban },
  { key: "calendar", label: "Calendario", icon: Calendar },
  { key: "timeline", label: "Cronograma", icon: GanttChartSquare },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const project = useStore((s) => s.projectById(id));
  const teams = useStore((s) => s.teams);
  const team = useStore((s) => s.teams.find((t) => t.id === project?.teamId));
  const tasksOf = useStore((s) => s.tasksOf(id));
  const users = useStore((s) => s.users);
  const userById = useStore((s) => s.userById);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const publishStatusUpdate = useStore((s) => s.publishStatusUpdate);
  const updateProject = useStore((s) => s.updateProject);
  const archiveProject = useStore((s) => s.archiveProject);
  const deleteProject = useStore((s) => s.deleteProject);

  const [view, setView] = useState<ProjectView>(project?.defaultView ?? "board");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Proyecto no encontrado.</p>
          <button onClick={() => router.push("/")} className="mt-2 text-sm font-medium text-brand-600">Volver al inicio</button>
        </div>
      </div>
    );
  }

  const filterFn = (t: Task) => {
    if (filterAssignee && t.assigneeId !== filterAssignee) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (hideCompleted && t.completed) return false;
    return true;
  };

  const activeFilters = [filterAssignee, filterPriority].filter(Boolean).length + (hideCompleted ? 1 : 0);
  const progress = progressOf(tasksOf);
  const lastStatus = project.statusUpdates[0];
  const members = project.memberIds.map(userById).filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 pt-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: project.color + "1a" }}>
              <Kanban size={20} style={{ color: project.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {renaming ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (renameValue.trim()) updateProject(project.id, { name: renameValue.trim() }); setRenaming(false); }}
                    className="flex items-center gap-1"
                  >
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={() => setRenaming(false)} className="rounded-md border border-gray-200 px-2 py-0.5 text-lg font-bold outline-none focus:border-brand-400" />
                  </form>
                ) : (
                  <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
                )}
                {project.status === "archived" && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Archivado</span>}
                <button onClick={() => toggleFavorite(project.id)}>
                  <Star size={16} className={project.favorite ? "text-amber-400" : "text-gray-300 hover:text-amber-400"} fill={project.favorite ? "currentColor" : "none"} />
                </button>
                <div className="relative">
                  <button onClick={() => setMenuOpen((v) => !v)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><MoreHorizontal size={16} /></button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute left-0 top-8 z-20 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <button onClick={() => { setRenaming(true); setRenameValue(project.name); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Pencil size={14} className="text-gray-400" /> Renombrar
                        </button>
                        <button onClick={() => { setEditOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings2 size={14} className="text-gray-400" /> Editar (color, equipo…)
                        </button>
                        <button onClick={() => { archiveProject(project.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Archive size={14} className="text-gray-400" /> {project.status === "archived" ? "Desarchivar" : "Archivar"}
                        </button>
                        <button onClick={() => { if (confirm(`¿Eliminar el proyecto "${project.name}" y todas sus tareas? Esta acción no se puede deshacer.`)) { deleteProject(project.id); router.push("/"); } setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">{team?.name} · {progress}% completado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((u) => u && <Avatar key={u.id} user={u} size={28} className="ring-2 ring-white" />)}
            </div>
            <button onClick={() => setStatusModal(true)} className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              {lastStatus ? (
                <>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: healthMeta[lastStatus.health].dot }} />
                  <span className="hidden sm:inline">{healthMeta[lastStatus.health].label}</span>
                </>
              ) : (
                <span className="hidden sm:inline">Actualizar estado</span>
              )}
            </button>
          </div>
        </div>

        {/* View switcher */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
            {viewTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  view === tab.key ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium", activeFilters > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
          >
            <Filter size={14} /> Filtrar {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 py-2">
            <div className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-sm">
              <Users size={13} className="text-gray-400" />
              <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="bg-transparent text-sm outline-none">
                <option value="">Todos</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-sm">
              <Flag size={13} className="text-gray-400" />
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-transparent text-sm outline-none">
                <option value="">Cualquier prioridad</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <label className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600">
              <input type="checkbox" checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} className="rounded" />
              Ocultar completadas
            </label>
            {activeFilters > 0 && (
              <button onClick={() => { setFilterAssignee(""); setFilterPriority(""); setHideCompleted(false); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <X size={13} /> Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-auto">
        {view === "list" && <ListView projectId={id} filterFn={filterFn} />}
        {view === "board" && <BoardView projectId={id} filterFn={filterFn} />}
        {view === "calendar" && <CalendarView projectId={id} filterFn={filterFn} />}
        {view === "timeline" && <TimelineView projectId={id} filterFn={filterFn} />}
        {view === "dashboard" && <DashboardView projectId={id} filterFn={filterFn} />}
      </div>

      <StatusUpdateModal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        projectId={id}
        onPublish={(health, summary) => { publishStatusUpdate(id, health, summary); setStatusModal(false); }}
      />

      <EditProjectModal open={editOpen} onClose={() => setEditOpen(false)} projectId={id} teams={teams} onSave={updateProject} />
    </div>
  );
}

const projectPalette = ["#6b46e5", "#e5466b", "#46a5e5", "#2bb673", "#f59e0b", "#8b5cf6", "#0ea5e9", "#ec4899"];

function EditProjectModal({
  open, onClose, projectId, teams, onSave,
}: {
  open: boolean; onClose: () => void; projectId: string;
  teams: { id: string; name: string }[];
  onSave: (id: string, patch: { name?: string; description?: string; color?: string; teamId?: string }) => void;
}) {
  const project = useStore((s) => s.projectById(projectId));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [teamId, setTeamId] = useState("");
  const [lastId, setLastId] = useState<string | null>(null);

  if (project && open && project.id !== lastId) {
    setLastId(project.id);
    setName(project.name);
    setDescription(project.description ?? "");
    setColor(project.color);
    setTeamId(project.teamId);
  }
  if (!project) return null;

  return (
    <Modal open={open} onClose={() => { onClose(); setLastId(null); }} title="Editar proyecto">
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(project.id, { name: name.trim() || project.name, description: description.trim() || undefined, color, teamId }); onClose(); setLastId(null); }}
        className="space-y-3 px-5 pb-5 pt-3"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="modal-input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Descripción</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="modal-input resize-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Equipo</span>
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="modal-input">
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-500">Color</span>
            <div className="flex flex-wrap gap-1.5">
              {projectPalette.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={cn("h-6 w-6 rounded-full", color === c && "ring-2 ring-offset-1 ring-gray-400")} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => { onClose(); setLastId(null); }}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}

function StatusUpdateModal({
  open, onClose, projectId, onPublish,
}: { open: boolean; onClose: () => void; projectId: string; onPublish: (h: HealthColor, s: string) => void }) {
  const project = useStore((s) => s.projectById(projectId));
  const userById = useStore((s) => s.userById);
  const [health, setHealth] = useState<HealthColor>("on_track");
  const [summary, setSummary] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Actualización de estado">
      <div className="space-y-4 px-5 pb-5 pt-3">
        <div className="flex gap-2">
          {(Object.keys(healthMeta) as HealthColor[]).map((h) => (
            <button
              key={h}
              onClick={() => setHealth(h)}
              className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-sm font-medium transition-colors")}
              style={health === h ? { borderColor: healthMeta[h].dot, backgroundColor: healthMeta[h].bg, color: healthMeta[h].color } : { borderColor: "#e5e7eb", color: "#6b7280" }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: healthMeta[h].dot }} />
              {healthMeta[h].label}
            </button>
          ))}
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Resumen del estado del proyecto…"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={!summary.trim()} onClick={() => onPublish(health, summary.trim())}>Publicar</Button>
        </div>

        {project && project.statusUpdates.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Historial</h4>
            <div className="space-y-2">
              {project.statusUpdates.map((u) => (
                <div key={u.id} className="flex gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: healthMeta[u.health].dot }} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700">{u.summary}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{userById(u.authorId)?.name} · {new Date(u.createdAt).toLocaleDateString("es-CL")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
