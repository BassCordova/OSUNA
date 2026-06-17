"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FolderPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Modal, Button } from "./ui";
import type { Priority } from "@/lib/types";
import { priorityMeta } from "@/lib/utils";

export function QuickCreateModal() {
  const open = useUI((s) => s.quickCreateOpen);
  const setOpen = useUI((s) => s.setQuickCreate);
  const openTask = useUI((s) => s.openTask);
  const router = useRouter();

  const projects = useStore((s) => s.projects);
  const sections = useStore((s) => s.sections);
  const teams = useStore((s) => s.teams);
  const users = useStore((s) => s.users);
  const createTask = useStore((s) => s.createTask);
  const createProject = useStore((s) => s.createProject);

  const [tab, setTab] = useState<"task" | "project">("task");

  // task form
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");

  // project form
  const [pName, setPName] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");

  const close = () => {
    setOpen(false);
    setName(""); setAssigneeId(""); setDueDate(""); setPriority(""); setPName("");
  };

  const submitTask = () => {
    if (!name.trim() || !projectId) return;
    const firstSection = sections.find((s) => s.projectId === projectId);
    if (!firstSection) return;
    const task = createTask({
      name: name.trim(), projectId, sectionId: firstSection.id,
      assigneeId: assigneeId || undefined, dueDate: dueDate || undefined,
      priority: priority || undefined,
    });
    close();
    openTask(task.id);
  };

  const submitProject = () => {
    if (!pName.trim() || !teamId) return;
    const project = createProject({ name: pName.trim(), teamId });
    close();
    router.push(`/project/${project.id}`);
  };

  return (
    <Modal open={open} onClose={close} title="Crear">
      <div className="px-5 pb-5 pt-3">
        <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button onClick={() => setTab("task")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium ${tab === "task" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
            <CheckCircle2 size={15} /> Tarea
          </button>
          <button onClick={() => setTab("project")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium ${tab === "project" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
            <FolderPlus size={15} /> Proyecto
          </button>
        </div>

        {tab === "task" ? (
          <form onSubmit={(e) => { e.preventDefault(); submitTask(); }} className="space-y-3">
            <input
              autoFocus value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la tarea"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Proyecto</span>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm">
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Asignar a</span>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm">
                  <option value="">Sin asignar</option>
                  {users.filter((u) => u.role !== "guest").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Vencimiento</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Prioridad</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | "")} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm">
                  <option value="">Ninguna</option>
                  {(Object.keys(priorityMeta) as Priority[]).map((p) => <option key={p} value={p}>{priorityMeta[p].label}</option>)}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={!name.trim()}>Crear tarea</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submitProject(); }} className="space-y-3">
            <input
              autoFocus value={pName} onChange={(e) => setPName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
            />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Equipo</span>
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm">
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <p className="text-xs text-gray-400">Se crearán secciones por defecto: Por hacer · En progreso · Completado.</p>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={!pName.trim()}>Crear proyecto</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
