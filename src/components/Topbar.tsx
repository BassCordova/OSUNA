"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, Search, Plus, Bell, Check, Cloud, CloudOff, Loader2, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "./Avatar";

type SaveState = "idle" | "saving" | "saved" | "error";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const currentUser = useStore((s) => s.currentUser());
  const notifications = useStore((s) => s.notifications);
  const setQuickCreate = useUI((s) => s.setQuickCreate);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const unread = notifications.filter((n) => !n.read && !n.archived).length;

  const [save, setSave] = useState<SaveState>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSave = (e: Event) => {
      const detail = (e as CustomEvent).detail as SaveState;
      setSave(detail);
      if (detail === "saved") {
        const t = setTimeout(() => setSave("idle"), 2000);
        return () => clearTimeout(t);
      }
    };
    window.addEventListener("osuna:save", onSave);
    return () => window.removeEventListener("osuna:save", onSave);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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

      <SaveIndicator state={save} />

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

        <div className="relative ml-1" ref={menuRef}>
          <button onClick={() => setMenuOpen((v) => !v)} title={currentUser.name}>
            <Avatar user={currentUser} size={30} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-3 py-2">
                <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                <div className="truncate text-xs text-gray-400">{currentUser.email}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LogOut size={15} className="text-gray-400" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") {
    return <span className="hidden items-center gap-1 text-xs text-gray-400 sm:flex"><Cloud size={14} /> Guardado</span>;
  }
  if (state === "saving") {
    return <span className="hidden items-center gap-1 text-xs text-gray-400 sm:flex"><Loader2 size={13} className="animate-spin" /> Guardando…</span>;
  }
  if (state === "saved") {
    return <span className="hidden items-center gap-1 text-xs text-green-600 sm:flex"><Check size={14} /> Guardado</span>;
  }
  return <span className="flex items-center gap-1 text-xs text-red-500" title="No se pudo guardar"><CloudOff size={14} /> Error</span>;
}
