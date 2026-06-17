"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Hash, ArrowRight, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "@/components/Avatar";
import { cn, formatDate, isOverdue, progressOf, healthMeta } from "@/lib/utils";

export default function HomePage() {
  const currentUser = useStore((s) => s.currentUser());
  const myTasks = useStore((s) => s.myTasks());
  const projects = useStore((s) => s.projects.filter((p) => p.status === "active"));
  const tasks = useStore((s) => s.tasks);
  const toggleComplete = useStore((s) => s.toggleComplete);
  const tasksOf = useStore((s) => s.tasksOf);
  const openTask = useUI((s) => s.openTask);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = myTasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 6);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  const completedToday = myTasks.filter((t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-gray-500">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{greeting}, {currentUser.name.split(" ")[0]}</h1>
        <div className="mt-3 inline-flex items-center gap-4 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600">
          <span><b className="text-gray-900">{myTasks.filter((t) => !t.completed).length}</b> tareas pendientes</span>
          <span className="h-3 w-px bg-gray-200" />
          <span><b className="text-gray-900">{completedToday}</b> completadas hoy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* My tasks */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Avatar user={currentUser} size={24} />
              <h2 className="text-sm font-semibold text-gray-900">Mis tareas</h2>
            </div>
            <Link href="/my-tasks" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>
          <div className="p-2">
            {upcoming.length === 0 && <p className="px-2 py-6 text-center text-sm text-gray-400">¡Sin pendientes! 🎉</p>}
            {upcoming.map((t) => (
              <div key={t.id} onClick={() => openTask(t.id)} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-gray-50">
                <button onClick={(e) => { e.stopPropagation(); toggleComplete(t.id); }}>
                  <Circle size={17} className="text-gray-300 hover:text-green-500" />
                </button>
                <span className="flex-1 truncate text-sm text-gray-700">{t.name}</span>
                {t.dueDate && (
                  <span className={cn("text-xs", isOverdue(t.dueDate, t.completed) ? "font-medium text-red-600" : "text-gray-400")}>
                    {formatDate(t.dueDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Proyectos recientes</h2>
          </div>
          <div className="p-2">
            {projects.map((p) => {
              const pt = tasksOf(p.id);
              const progress = progressOf(pt);
              const health = p.statusUpdates[0]?.health;
              return (
                <Link key={p.id} href={`/project/${p.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: p.color + "1a" }}>
                    <Hash size={18} style={{ color: p.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-800">{p.name}</span>
                      {health && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: healthMeta[health].dot }} />}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="text-xs text-gray-400">{progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <div className="text-sm text-gray-600">
          <b className="text-gray-800">Consejo:</b> presiona <kbd className="rounded border border-gray-300 bg-white px-1 text-xs">c</kbd> para crear una tarea rápida, o <kbd className="rounded border border-gray-300 bg-white px-1 text-xs">⌘K</kbd> para buscar en todo OSUNA.
        </div>
      </div>
    </div>
  );
}
