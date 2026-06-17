"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TaskModal } from "./TaskModal";
import { QuickCreateModal } from "./QuickCreateModal";
import { SearchModal } from "./SearchModal";
import { useUI } from "@/lib/ui-store";
import { useStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const setQuickCreate = useUI((s) => s.setQuickCreate);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Atajos de teclado globales
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (!typing && e.key === "c") {
        e.preventDefault();
        setQuickCreate(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setQuickCreate, setSearchOpen]);

  if (!mounted || !hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-brand-600">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <span className="text-sm font-medium">Cargando OSUNA…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
      <TaskModal />
      <QuickCreateModal />
      <SearchModal />
    </div>
  );
}
