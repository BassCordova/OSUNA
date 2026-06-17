"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle2, Hash, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Modal } from "./ui";

export function SearchModal() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const openTask = useUI((s) => s.openTask);
  const router = useRouter();

  const tasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.projects);
  const users = useStore((s) => s.users);

  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { tasks: [], projects: [], users: [] };
    return {
      tasks: tasks.filter((t) => !t.parentId && t.name.toLowerCase().includes(term)).slice(0, 6),
      projects: projects.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 4),
      users: users.filter((u) => u.name.toLowerCase().includes(term)).slice(0, 4),
    };
  }, [q, tasks, projects, users]);

  const close = () => { setOpen(false); setQ(""); };

  return (
    <Modal open={open} onClose={close}>
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <Search size={18} className="text-gray-400" />
        <input
          autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar tareas, proyectos, personas…"
          className="flex-1 border-none bg-transparent text-sm outline-none"
        />
        <kbd className="rounded border border-gray-200 px-1.5 text-[10px] text-gray-400">esc</kbd>
      </div>
      <div className="max-h-96 overflow-y-auto p-2">
        {!q.trim() && <div className="px-2 py-6 text-center text-sm text-gray-400">Escribe para buscar en todo OSUNA</div>}

        {results.tasks.length > 0 && (
          <Section title="Tareas">
            {results.tasks.map((t) => (
              <button key={t.id} onClick={() => { openTask(t.id); close(); }} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100">
                <CheckCircle2 size={15} className={t.completed ? "text-green-500" : "text-gray-300"} />
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </Section>
        )}
        {results.projects.length > 0 && (
          <Section title="Proyectos">
            {results.projects.map((p) => (
              <button key={p.id} onClick={() => { router.push(`/project/${p.id}`); close(); }} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100">
                <Hash size={15} style={{ color: p.color }} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </Section>
        )}
        {results.users.length > 0 && (
          <Section title="Personas">
            {results.users.map((u) => (
              <div key={u.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm">
                <UserIcon size={15} className="text-gray-400" />
                <span>{u.name}</span>
                <span className="text-xs text-gray-400">· {u.jobTitle}</span>
              </div>
            ))}
          </Section>
        )}

        {q.trim() && results.tasks.length === 0 && results.projects.length === 0 && results.users.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-gray-400">Sin resultados para “{q}”</div>
        )}
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</div>
      {children}
    </div>
  );
}
