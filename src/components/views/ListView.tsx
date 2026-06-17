"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { TaskRow } from "@/components/TaskRow";
import { cn } from "@/lib/utils";
import type { Task, ID } from "@/lib/types";

export function ListView({ projectId, filterFn }: { projectId: ID; filterFn: (t: Task) => boolean }) {
  const sections = useStore((s) => s.sectionsOf(projectId));
  const tasks = useStore((s) => s.tasks);
  const createTask = useStore((s) => s.createTask);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingIn, setAddingIn] = useState<ID | null>(null);
  const [name, setName] = useState("");

  const tasksBySection = (sectionId: ID) =>
    tasks
      .filter((t) => !t.parentId && t.memberships.some((m) => m.sectionId === sectionId) && filterFn(t))
      .sort((a, b) => a.order - b.order);

  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span className="flex-1">Tarea</span>
          <span className="hidden w-16 text-right sm:block">Fecha</span>
          <span className="w-6 text-center">Resp.</span>
        </div>

        {sections.map((section) => {
          const sectionTasks = tasksBySection(section.id);
          const isCollapsed = collapsed[section.id];
          return (
            <div key={section.id}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                className="flex w-full items-center gap-1.5 border-b border-gray-100 bg-gray-50/50 px-3 py-1.5 text-left"
              >
                {isCollapsed ? <ChevronRight size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                <span className="text-sm font-semibold text-gray-700">{section.name}</span>
                <span className="text-xs text-gray-400">{sectionTasks.length}</span>
              </button>
              {!isCollapsed && (
                <>
                  {sectionTasks.map((t) => <TaskRow key={t.id} task={t} />)}
                  {addingIn === section.id ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); if (name.trim()) { createTask({ name: name.trim(), projectId, sectionId: section.id }); setName(""); } }}
                      className="border-b border-gray-100 px-3 py-1.5"
                    >
                      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setAddingIn(null)} placeholder="Nombre de la tarea" className="w-full border-none text-sm outline-none placeholder:text-gray-400" />
                    </form>
                  ) : (
                    <button onClick={() => setAddingIn(section.id)} className="flex w-full items-center gap-2 border-b border-gray-100 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50">
                      <Plus size={15} /> Añadir tarea
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
