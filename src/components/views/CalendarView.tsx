"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import type { Task, ID } from "@/lib/types";

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarView({ projectId, filterFn }: { projectId: ID; filterFn: (t: Task) => boolean }) {
  const tasksOf = useStore((s) => s.tasksOf(projectId));
  const openTask = useUI((s) => s.openTask);
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const tasks = tasksOf.filter(filterFn).filter((t) => t.dueDate);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const tasksOn = (date: Date) => {
    const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate === ds);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {cursor.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-50"><ChevronLeft size={16} /></button>
          <button onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">Hoy</button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-50"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekdays.map((w) => (
            <div key={w} className="px-2 py-1.5 text-center text-xs font-semibold text-gray-400">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const dstr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
            const isToday = dstr === todayStr;
            const dayTasks = date ? tasksOn(date) : [];
            return (
              <div key={i} className={cn("min-h-[96px] border-b border-r border-gray-100 p-1", !date && "bg-gray-50/50")}>
                {date && (
                  <>
                    <div className={cn("mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs", isToday ? "bg-brand-600 font-semibold text-white" : "text-gray-500")}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => openTask(t.id)}
                          className={cn("block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium", t.completed ? "bg-green-50 text-green-600 line-through" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}
                        >
                          {t.name}
                        </button>
                      ))}
                      {dayTasks.length > 3 && <div className="px-1.5 text-[10px] text-gray-400">+{dayTasks.length - 3} más</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
