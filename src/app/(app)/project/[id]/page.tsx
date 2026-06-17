"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  List, Kanban, Calendar, GanttChartSquare, LayoutDashboard, Star,
  Filter, Users, Flag, CheckCircle2, X,
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
  const team = useStore((s) => s.teams.find((t) => t.id === project?.teamId));
  const tasksOf = useStore((s) => s.tasksOf(id));
  const users = useStore((s) => s.users);
  const userById = useStore((s) => s.userById);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const publishStatusUpdate = useStore((s) => s.publishStatusUpdate);

  const [view, setView] = useState<ProjectView>(project?.defaultView ?? "board");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

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
                <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
                <button onClick={() => toggleFavorite(project.id)}>
                  <Star size={16} className={project.favorite ? "text-amber-400" : "text-gray-300 hover:text-amber-400"} fill={project.favorite ? "currentColor" : "none"} />
                </button>
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
    </div>
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
