"use client";

import Link from "next/link";
import { Menu, Search, Plus, Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "./Avatar";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const currentUser = useStore((s) => s.currentUser());
  const notifications = useStore((s) => s.notifications);
  const setQuickCreate = useUI((s) => s.setQuickCreate);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const unread = notifications.filter((n) => !n.read && !n.archived).length;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 sm:px-4">
      <button className="rounded p-1.5 text-gray-500 hover:bg-gray-100 md:hidden" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-100 sm:max-w-md"
      >
        <Search size={16} />
        <span>Buscar tareas, proyectos, personas…</span>
        <kbd className="ml-auto hidden rounded border border-gray-200 bg-white px-1.5 text-[10px] text-gray-400 sm:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setQuickCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          title="Crear (c)"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Crear</span>
        </button>

        <Link href="/inbox" className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100" title="Notificaciones">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>

        <button className="ml-1" title={currentUser.name}>
          <Avatar user={currentUser} size={30} />
        </button>
      </div>
    </header>
  );
}
