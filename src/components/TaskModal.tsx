"use client";

import { useState } from "react";
import {
  CheckCircle2, Circle, Calendar, Flag, Trash2, Plus, Send,
  Diamond, ShieldCheck, Link2, MessageSquare, Activity as ActivityIcon, FolderPlus,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Modal, Button, PriorityBadge, Badge } from "./ui";
import { Avatar } from "./Avatar";
import { cn, formatDate, relativeTime, isOverdue, priorityMeta } from "@/lib/utils";
import type { Priority, ID } from "@/lib/types";

export function TaskModal() {
  const activeTaskId = useUI((s) => s.activeTaskId);
  const closeTask = useUI((s) => s.closeTask);
  const openTask = useUI((s) => s.openTask);
  const task = useStore((s) => s.tasks.find((t) => t.id === activeTaskId));
  const users = useStore((s) => s.users);
  const projects = useStore((s) => s.projects);
  const sections = useStore((s) => s.sections);
  const customFields = useStore((s) => s.customFields);
  const subtasks = useStore((s) => (activeTaskId ? s.subtasksOf(activeTaskId) : []));
  const allTasks = useStore((s) => s.tasks);

  const updateTask = useStore((s) => s.updateTask);
  const toggleComplete = useStore((s) => s.toggleComplete);
  const deleteTask = useStore((s) => s.deleteTask);
  const addComment = useStore((s) => s.addComment);
  const addSubtask = useStore((s) => s.addSubtask);
  const addToProject = useStore((s) => s.addToProject);
  const userById = useStore((s) => s.userById);

  const [commentText, setCommentText] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [addingProject, setAddingProject] = useState(false);

  if (!task) return null;

  const assignee = userById(task.assigneeId);
  const taskProjects = task.memberships
    .map((m) => projects.find((p) => p.id === m.projectId))
    .filter(Boolean);
  const availableProjects = projects.filter((p) => !task.memberships.some((m) => m.projectId === p.id));

  const submitComment = () => {
    if (!commentText.trim()) return;
    addComment(task.id, commentText.trim());
    setCommentText("");
  };

  return (
    <Modal open onClose={closeTask} wide>
      <div className="max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <button
            onClick={() => toggleComplete(task.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium transition-colors",
              task.completed
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {task.completed ? "Completada" : "Marcar completa"}
          </button>
          <div className="flex items-center gap-1">
            {task.isMilestone && <Badge color="#7c3aed" bg="#f3e8ff"><Diamond size={11} /> Hito</Badge>}
            {task.isApproval && <Badge color="#0369a1" bg="#e0f2fe"><ShieldCheck size={11} /> Aprobación</Badge>}
            <button
              onClick={() => { deleteTask(task.id); closeTask(); }}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1fr_280px]">
          {/* Main column */}
          <div className="space-y-5 p-5">
            <input
              value={task.name}
              onChange={(e) => updateTask(task.id, { name: e.target.value })}
              className={cn(
                "w-full border-none bg-transparent text-xl font-semibold text-gray-900 outline-none focus:ring-0",
                task.completed && "text-gray-400 line-through"
              )}
            />

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Descripción</label>
              <textarea
                value={task.description ?? ""}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                placeholder="Añade más detalle…"
                rows={3}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
              />
            </div>

            {/* Dependencies */}
            {(task.blockedByIds.length > 0 || task.blockingIds.length > 0) && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Dependencias</label>
                {task.blockedByIds.map((id) => {
                  const dep = allTasks.find((t) => t.id === id);
                  return dep ? (
                    <button key={id} onClick={() => openTask(id)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600">
                      <Link2 size={14} className="text-amber-500" />
                      <span>Bloqueada por:</span>
                      <span className={cn("font-medium", dep.completed && "line-through text-gray-400")}>{dep.name}</span>
                    </button>
                  ) : null;
                })}
                {task.blockingIds.map((id) => {
                  const dep = allTasks.find((t) => t.id === id);
                  return dep ? (
                    <button key={id} onClick={() => openTask(id)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600">
                      <Link2 size={14} className="text-blue-500" />
                      <span>Bloqueando:</span>
                      <span className="font-medium">{dep.name}</span>
                    </button>
                  ) : null;
                })}
              </div>
            )}

            {/* Subtasks */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Subtareas {subtasks.length > 0 && `(${subtasks.filter((s) => s.completed).length}/${subtasks.length})`}
              </label>
              <div className="space-y-1">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-gray-50">
                    <button onClick={() => toggleComplete(sub.id)}>
                      {sub.completed ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300" />}
                    </button>
                    <span className={cn("flex-1 text-sm", sub.completed && "text-gray-400 line-through")}>{sub.name}</span>
                    {sub.assigneeId && <Avatar user={userById(sub.assigneeId)} size={20} />}
                    {sub.dueDate && <span className="text-xs text-gray-400">{formatDate(sub.dueDate)}</span>}
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); if (newSubtask.trim()) { addSubtask(task.id, newSubtask.trim()); setNewSubtask(""); } }}
                className="mt-1 flex items-center gap-2 px-1"
              >
                <Plus size={16} className="text-gray-300" />
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Añadir subtarea"
                  className="flex-1 border-none bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
                />
              </form>
            </div>

            {/* Comments / Activity */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <MessageSquare size={13} /> Comentarios y actividad
              </label>
              <div className="space-y-3">
                {task.comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    {c.authorId === "system" ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600"><ActivityIcon size={14} /></div>
                    ) : (
                      <Avatar user={userById(c.authorId)} size={28} />
                    )}
                    <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-gray-800">{c.authorId === "system" ? "Automatización" : userById(c.authorId)?.name}</span>
                        <span className="text-xs text-gray-400">{relativeTime(c.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">{c.body}</p>
                    </div>
                  </div>
                ))}
                {task.activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 pl-1 text-xs text-gray-400">
                    <ActivityIcon size={12} />
                    <span className="font-medium text-gray-500">{userById(a.actorId)?.name ?? "Alguien"}</span>
                    <span>{a.text}</span>
                    <span>· {relativeTime(a.createdAt)}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submitComment(); }} className="mt-3 flex items-start gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitComment(); } }}
                  placeholder="Escribe un comentario… (@ para mencionar)"
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
                />
                <Button variant="primary" type="submit" className="mt-0.5"><Send size={14} /></Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 border-t border-gray-100 bg-gray-50/50 p-5 sm:border-l sm:border-t-0">
            <Field label="Asignado">
              <select
                value={task.assigneeId ?? ""}
                onChange={(e) => updateTask(task.id, { assigneeId: e.target.value || undefined })}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400"
              >
                <option value="">Sin asignar</option>
                {users.filter((u) => u.role !== "guest").map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Fecha de vencimiento">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-gray-400" />
                <input
                  type="date"
                  value={task.dueDate ?? ""}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                  className={cn(
                    "flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400",
                    isOverdue(task.dueDate, task.completed) && "text-red-600"
                  )}
                />
              </div>
            </Field>

            <Field label="Prioridad">
              <div className="flex items-center gap-2">
                <Flag size={15} className="text-gray-400" />
                <select
                  value={task.priority ?? ""}
                  onChange={(e) => updateTask(task.id, { priority: (e.target.value || undefined) as Priority })}
                  className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                >
                  <option value="">Ninguna</option>
                  {(Object.keys(priorityMeta) as Priority[]).map((p) => (
                    <option key={p} value={p}>{priorityMeta[p].label}</option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Proyectos">
              <div className="space-y-1.5">
                {taskProjects.map((p) => p && (
                  <div key={p.id} className="flex items-center gap-2 rounded-md bg-white px-2 py-1 text-sm">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </div>
                ))}
                {addingProject ? (
                  <select
                    autoFocus
                    onChange={(e) => {
                      const proj = projects.find((p) => p.id === e.target.value);
                      const firstSection = sections.find((s) => s.projectId === e.target.value);
                      if (proj && firstSection) addToProject(task.id, proj.id, firstSection.id);
                      setAddingProject(false);
                    }}
                    onBlur={() => setAddingProject(false)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="">Selecciona proyecto…</option>
                    {availableProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                ) : (
                  availableProjects.length > 0 && (
                    <button onClick={() => setAddingProject(true)} className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700">
                      <FolderPlus size={13} /> Añadir a proyecto (multi-homing)
                    </button>
                  )
                )}
              </div>
            </Field>

            {/* Custom fields */}
            {Array.from(new Set(taskProjects.flatMap((p) => p?.customFieldIds ?? []))).map((cfId) => {
              const cf = customFields.find((c) => c.id === cfId);
              if (!cf) return null;
              const value = task.customFieldValues[cf.id];
              return (
                <Field key={cf.id} label={cf.name}>
                  {cf.type === "single_select" && cf.options ? (
                    <select
                      value={(value as string) ?? ""}
                      onChange={(e) => updateTask(task.id, { customFieldValues: { ...task.customFieldValues, [cf.id]: e.target.value } })}
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    >
                      <option value="">—</option>
                      {cf.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  ) : cf.type === "number" ? (
                    <input
                      type="number"
                      value={(value as number) ?? ""}
                      onChange={(e) => updateTask(task.id, { customFieldValues: { ...task.customFieldValues, [cf.id]: e.target.value ? Number(e.target.value) : null } })}
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    />
                  ) : (
                    <input
                      value={(value as string) ?? ""}
                      onChange={(e) => updateTask(task.id, { customFieldValues: { ...task.customFieldValues, [cf.id]: e.target.value } })}
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    />
                  )}
                </Field>
              );
            })}

            {task.isApproval && (
              <Field label="Estado de aprobación">
                <div className="flex flex-wrap gap-1">
                  {([["approved", "Aprobar", "#16a34a"], ["changes", "Pedir cambios", "#d97706"], ["rejected", "Rechazar", "#dc2626"]] as const).map(([val, label, color]) => (
                    <button
                      key={val}
                      onClick={() => updateTask(task.id, { approvalStatus: val })}
                      className={cn("rounded-md border px-2 py-1 text-xs font-medium", task.approvalStatus === val ? "text-white" : "bg-white")}
                      style={task.approvalStatus === val ? { backgroundColor: color, borderColor: color } : { color, borderColor: color + "55" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      {children}
    </div>
  );
}
