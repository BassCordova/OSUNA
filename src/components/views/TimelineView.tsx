"use client";

import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CalendarRange } from "lucide-react";
import type { Task, ID } from "@/lib/types";

const dayMs = 86400000;

export function TimelineView({ projectId, filterFn }: { projectId: ID; filterFn: (t: Task) => boolean }) {
  const project = useStore((s) => s.projectById(projectId));
  const tasksOf = useStore((s) => s.tasksOf(projectId));
  const userById = useStore((s) => s.userById);
  const openTask = useUI((s) => s.openTask);

  const dated = tasksOf.filter(filterFn).filter((t) => t.dueDate);
  if (dated.length === 0) {
    return <EmptyState icon={<CalendarRange size={40} />} title="Sin tareas con fecha" hint="Asigna fechas de vencimiento para ver la línea de tiempo." />;
  }

  const dates = dated.flatMap((t) => [t.startDate, t.dueDate].filter(Boolean) as string[]);
  let min = new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
  let max = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
  min = new Date(min.getTime() - 2 * dayMs);
  max = new Date(max.getTime() + 2 * dayMs);
  const totalDays = Math.max(1, Math.round((max.getTime() - min.getTime()) / dayMs));
  const colWidth = 36;

  const dayCols: Date[] = [];
  for (let i = 0; i <= totalDays; i++) dayCols.push(new Date(min.getTime() + i * dayMs));

  const offsetOf = (d: string) => Math.round((new Date(d + "T00:00:00").getTime() - min.getTime()) / dayMs);
  const todayOffset = Math.round((Date.now() - min.getTime()) / dayMs);

  const sorted = [...dated].sort((a, b) => (a.startDate ?? a.dueDate ?? "").localeCompare(b.startDate ?? b.dueDate ?? ""));

  return (
    <div className="overflow-auto p-4">
      <div className="inline-block min-w-full rounded-xl border border-gray-200 bg-white">
        {/* Header de días */}
        <div className="flex border-b border-gray-200 bg-gray-50" style={{ paddingLeft: 240 }}>
          {dayCols.map((d, i) => (
            <div key={i} className="shrink-0 border-r border-gray-100 py-1 text-center" style={{ width: colWidth }}>
              <div className="text-[10px] text-gray-400">{d.toLocaleDateString("es-CL", { weekday: "narrow" })}</div>
              <div className={cn("text-xs", d.toDateString() === new Date().toDateString() ? "font-bold text-brand-600" : "text-gray-500")}>{d.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Filas */}
        <div className="relative">
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div className="absolute top-0 bottom-0 z-10 w-px bg-red-400" style={{ left: 240 + todayOffset * colWidth + colWidth / 2 }} />
          )}
          {sorted.map((t) => {
            const start = t.startDate ?? t.dueDate!;
            const end = t.dueDate!;
            const startOff = offsetOf(start);
            const span = Math.max(1, offsetOf(end) - startOff + 1);
            return (
              <div key={t.id} className="flex items-center border-b border-gray-100 hover:bg-gray-50">
                <div className="flex w-[240px] shrink-0 items-center gap-2 px-3 py-2">
                  <Avatar user={userById(t.assigneeId)} size={20} />
                  <span className={cn("truncate text-sm", t.completed && "text-gray-400 line-through")}>{t.name}</span>
                </div>
                <div className="relative flex-1" style={{ height: 36 }}>
                  <button
                    onClick={() => openTask(t.id)}
                    className={cn(
                      "absolute top-1/2 flex -translate-y-1/2 items-center rounded-md px-2 text-xs font-medium text-white shadow-sm",
                      t.isMilestone && "rotate-45"
                    )}
                    style={{
                      left: startOff * colWidth + 2,
                      width: t.isMilestone ? 20 : span * colWidth - 4,
                      height: t.isMilestone ? 20 : 22,
                      backgroundColor: t.completed ? "#9ca3af" : (project?.color ?? "#6b46e5"),
                    }}
                    title={t.name}
                  >
                    {!t.isMilestone && <span className="truncate">{t.name}</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
