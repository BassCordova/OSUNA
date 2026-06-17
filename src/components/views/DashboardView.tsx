"use client";

import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { progressOf, isOverdue } from "@/lib/utils";
import type { Task, ID } from "@/lib/types";

export function DashboardView({ projectId, filterFn }: { projectId: ID; filterFn: (t: Task) => boolean }) {
  const project = useStore((s) => s.projectById(projectId));
  const tasksOf = useStore((s) => s.tasksOf(projectId).filter(filterFn));
  const sections = useStore((s) => s.sectionsOf(projectId));
  const users = useStore((s) => s.users);
  const userById = useStore((s) => s.userById);

  const total = tasksOf.length;
  const completed = tasksOf.filter((t) => t.completed).length;
  const overdue = tasksOf.filter((t) => isOverdue(t.dueDate, t.completed)).length;
  const progress = progressOf(tasksOf);

  const bySection = sections.map((s) => ({
    label: s.name,
    count: tasksOf.filter((t) => t.memberships.some((m) => m.sectionId === s.id)).length,
  }));
  const maxSection = Math.max(1, ...bySection.map((s) => s.count));

  const byAssignee = users
    .map((u) => ({ user: u, count: tasksOf.filter((t) => t.assigneeId === u.id && !t.completed).length }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxAssignee = Math.max(1, ...byAssignee.map((a) => a.count));

  const color = project?.color ?? "#6b46e5";
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Tareas totales" value={total} />
        <Stat label="Completadas" value={completed} accent="#16a34a" />
        <Stat label="Pendientes" value={total - completed} accent="#6b46e5" />
        <Stat label="Atrasadas" value={overdue} accent="#dc2626" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Donut */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Avance general</h3>
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              <svg width={128} height={128} className="-rotate-90">
                <circle cx={64} cy={64} r={52} fill="none" stroke="#f1f5f9" strokeWidth={12} />
                <circle
                  cx={64} cy={64} r={52} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                <span className="text-xs text-gray-400">completado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks by section */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Tareas por sección</h3>
          <div className="space-y-2.5">
            {bySection.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-medium text-gray-500">{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${(s.count / maxSection) * 100}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload by assignee */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Carga por persona (pendientes)</h3>
          <div className="space-y-2.5">
            {byAssignee.length === 0 && <p className="text-sm text-gray-400">Sin tareas pendientes asignadas.</p>}
            {byAssignee.map((a) => (
              <div key={a.user.id} className="flex items-center gap-2">
                <Avatar user={a.user} size={24} />
                <span className="w-24 truncate text-xs text-gray-600">{a.user.name.split(" ")[0]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${(a.count / maxAssignee) * 100}%`, backgroundColor: a.user.avatarColor }} />
                </div>
                <span className="w-5 text-right text-xs font-medium text-gray-500">{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-2xl font-bold" style={{ color: accent ?? "#111827" }}>{value}</div>
      <div className="mt-0.5 text-xs font-medium text-gray-500">{label}</div>
    </div>
  );
}
