"use client";

import { useState } from "react";
import { BarChart3, AlertTriangle, UserX, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { TaskRow } from "@/components/TaskRow";
import { Avatar } from "@/components/Avatar";
import { isOverdue, cn } from "@/lib/utils";

export default function ReportsPage() {
  const tasks = useStore((s) => s.tasks.filter((t) => !t.parentId));
  const users = useStore((s) => s.users.filter((u) => u.role !== "guest"));
  const [report, setReport] = useState<"workload" | "overdue" | "unassigned" | "high">("workload");

  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.completed));
  const unassigned = tasks.filter((t) => !t.assigneeId && !t.completed);
  const highPriority = tasks.filter((t) => (t.priority === "high" || t.priority === "urgent") && !t.completed);

  // Workload: capacidad ~ 6 tareas/persona
  const capacity = 6;
  const workload = users.map((u) => ({
    user: u,
    count: tasks.filter((t) => t.assigneeId === u.id && !t.completed).length,
  })).sort((a, b) => b.count - a.count);
  const maxLoad = Math.max(capacity, ...workload.map((w) => w.count));

  const reports = [
    { key: "workload", label: "Carga de trabajo", icon: BarChart3, count: null },
    { key: "overdue", label: "Tareas atrasadas", icon: Clock, count: overdue.length },
    { key: "unassigned", label: "Sin asignar", icon: UserX, count: unassigned.length },
    { key: "high", label: "Alta prioridad", icon: AlertTriangle, count: highPriority.length },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <BarChart3 size={22} className="text-gray-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500">Búsquedas guardadas y carga del equipo</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {reports.map((r) => (
          <button
            key={r.key}
            onClick={() => setReport(r.key)}
            className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left", report === r.key ? "border-brand-300 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300")}
          >
            <r.icon size={18} className={report === r.key ? "text-brand-600" : "text-gray-400"} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-800">{r.label}</div>
              {r.count !== null && <div className="text-xs text-gray-400">{r.count} tareas</div>}
            </div>
          </button>
        ))}
      </div>

      {report === "workload" ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Carga de trabajo del equipo</h2>
          <p className="mb-4 text-xs text-gray-400">Tareas pendientes por persona. Capacidad de referencia: {capacity} tareas. Las barras rojas indican posible sobrecarga.</p>
          <div className="space-y-3">
            {workload.map((w) => {
              const over = w.count > capacity;
              return (
                <div key={w.user.id} className="flex items-center gap-3">
                  <Avatar user={w.user} size={32} />
                  <div className="w-32 shrink-0">
                    <div className="text-sm font-medium text-gray-700">{w.user.name.split(" ")[0]}</div>
                    <div className="text-xs text-gray-400">{w.user.jobTitle}</div>
                  </div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md"
                      style={{ width: `${Math.min(100, (w.count / maxLoad) * 100)}%`, backgroundColor: over ? "#ef4444" : w.user.avatarColor }}
                    />
                    <div className="absolute inset-y-0 border-l-2 border-dashed border-gray-400/60" style={{ left: `${(capacity / maxLoad) * 100}%` }} />
                  </div>
                  <span className={cn("w-16 text-right text-sm font-medium", over ? "text-red-600" : "text-gray-500")}>{w.count} {over && "⚠"}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {(report === "overdue" ? overdue : report === "unassigned" ? unassigned : highPriority).map((t) => (
            <TaskRow key={t.id} task={t} showProject />
          ))}
          {(report === "overdue" ? overdue : report === "unassigned" ? unassigned : highPriority).length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">Sin resultados. ¡Buen trabajo! 🎉</p>
          )}
        </div>
      )}
    </div>
  );
}
