"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { TaskRow } from "@/components/TaskRow";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/ui";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type GroupKey = "date" | "project";

export default function MyTasksPage() {
  const currentUser = useStore((s) => s.currentUser());
  const myTasks = useStore((s) => s.myTasks());
  const projects = useStore((s) => s.projects);
  const [groupBy, setGroupBy] = useState<GroupKey>("date");
  const [showCompleted, setShowCompleted] = useState(false);

  const visible = myTasks.filter((t) => showCompleted || !t.completed);

  const groups = groupBy === "date" ? groupByDate(visible) : groupByProject(visible, projects);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <Avatar user={currentUser} size={40} />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mis tareas</h1>
          <p className="text-sm text-gray-500">Todo lo asignado a ti, en todos los proyectos</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 text-sm">
          <button onClick={() => setGroupBy("date")} className={cn("rounded-md px-3 py-1 font-medium", groupBy === "date" ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}>Por fecha</button>
          <button onClick={() => setGroupBy("project")} className={cn("rounded-md px-3 py-1 font-medium", groupBy === "project" ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}>Por proyecto</button>
        </div>
        <label className="flex items-center gap-1.5 text-sm text-gray-500">
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} className="rounded" />
          Mostrar completadas
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={40} />} title="No tienes tareas asignadas" hint="Cuando te asignen trabajo aparecerá aquí." />
      ) : (
        <div className="space-y-5">
          {groups.map((g) => g.tasks.length > 0 && (
            <div key={g.label} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
                {g.color && <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: g.color }} />}
                <h2 className="text-sm font-semibold text-gray-700">{g.label}</h2>
                <span className="text-xs text-gray-400">{g.tasks.length}</span>
              </div>
              <div>
                {g.tasks.map((t) => <TaskRow key={t.id} task={t} showProject={groupBy === "date"} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDate(tasks: Task[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekEnd = new Date(today.getTime() + 7 * 86400000);

  const buckets = { overdue: [] as Task[], today: [] as Task[], upcoming: [] as Task[], later: [] as Task[], noDate: [] as Task[] };
  tasks.forEach((t) => {
    if (!t.dueDate) return buckets.noDate.push(t);
    const d = new Date(t.dueDate + "T00:00:00");
    if (d < today) buckets.overdue.push(t);
    else if (d < tomorrow) buckets.today.push(t);
    else if (d < weekEnd) buckets.upcoming.push(t);
    else buckets.later.push(t);
  });
  const sortByDate = (a: Task, b: Task) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  return [
    { label: "Atrasadas", tasks: buckets.overdue.sort(sortByDate), color: "#ef4444" },
    { label: "Hoy", tasks: buckets.today.sort(sortByDate), color: "#6b46e5" },
    { label: "Próximas (esta semana)", tasks: buckets.upcoming.sort(sortByDate), color: "#f59e0b" },
    { label: "Más adelante", tasks: buckets.later.sort(sortByDate), color: "#94a3b8" },
    { label: "Sin fecha", tasks: buckets.noDate, color: "#d1d5db" },
  ];
}

function groupByProject(tasks: Task[], projects: { id: string; name: string; color: string }[]) {
  return projects.map((p) => ({
    label: p.name,
    color: p.color,
    tasks: tasks.filter((t) => t.memberships.some((m) => m.projectId === p.id)),
  }));
}
