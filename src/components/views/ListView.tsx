"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { TaskRow } from "@/components/TaskRow";
import { cn } from "@/lib/utils";
import type { Task, ID } from "@/lib/types";

export function ListView({ projectId, filterFn }: { projectId: ID; filterFn: (t: Task) => boolean }) {
  const sections = useStore((s) => s.sectionsOf(projectId));
  const tasks = useStore((s) => s.tasks);
  const createTask = useStore((s) => s.createTask);
  const addSection = useStore((s) => s.addSection);
  const renameSection = useStore((s) => s.renameSection);
  const deleteSection = useStore((s) => s.deleteSection);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingIn, setAddingIn] = useState<ID | null>(null);
  const [name, setName] = useState("");
  const [menu, setMenu] = useState<ID | null>(null);
  const [renaming, setRenaming] = useState<ID | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState("");

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
              <div className="group flex items-center gap-1.5 border-b border-gray-100 bg-gray-50/50 px-3 py-1.5">
                <button onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))} className="text-gray-400">
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
                {renaming === section.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); if (renameValue.trim()) renameSection(section.id, renameValue.trim()); setRenaming(null); }}>
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={() => setRenaming(null)} className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-sm font-semibold" />
                  </form>
                ) : (
                  <button onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))} className="text-sm font-semibold text-gray-700">{section.name}</button>
                )}
                <span className="text-xs text-gray-400">{sectionTasks.length}</span>
                <div className="relative ml-auto">
                  <button onClick={() => setMenu(menu === section.id ? null : section.id)} className="rounded p-0.5 text-gray-300 opacity-0 hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100"><MoreHorizontal size={15} /></button>
                  {menu === section.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                      <div className="absolute right-0 top-6 z-20 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <button onClick={() => { setRenaming(section.id); setRenameValue(section.name); setMenu(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Pencil size={13} className="text-gray-400" /> Renombrar</button>
                        <button onClick={() => { if (confirm(`¿Eliminar la sección "${section.name}"?`)) deleteSection(section.id); setMenu(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"><Trash2 size={13} /> Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
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

      <div className="mt-2">
        {addingSection ? (
          <form onSubmit={(e) => { e.preventDefault(); if (newSection.trim()) { addSection(projectId, newSection.trim()); setNewSection(""); setAddingSection(false); } }}>
            <input autoFocus value={newSection} onChange={(e) => setNewSection(e.target.value)} onBlur={() => setAddingSection(false)} placeholder="Nombre de la sección" className="w-64 rounded-md border border-gray-200 px-2 py-1.5 text-sm" />
          </form>
        ) : (
          <button onClick={() => setAddingSection(true)} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600">
            <Plus size={15} /> Añadir sección
          </button>
        )}
      </div>
    </div>
  );
}
