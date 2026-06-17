"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, CheckCircle2, Inbox, BarChart3, Briefcase, Target, Plus,
  ChevronDown, ChevronRight, Star, Hash, Settings, X, Workflow,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/my-tasks", label: "Mis tareas", icon: CheckCircle2 },
  { href: "/inbox", label: "Bandeja de entrada", icon: Inbox },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/portfolios", label: "Portafolios", icon: Briefcase },
  { href: "/goals", label: "Objetivos", icon: Target },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const teams = useStore((s) => s.teams);
  const projects = useStore((s) => s.projects);
  const notifications = useStore((s) => s.notifications);
  const setQuickCreate = useUI((s) => s.setQuickCreate);
  const unread = notifications.filter((n) => !n.read && !n.archived).length;

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(teams.map((t) => [t.id, true]))
  );
  const favorites = projects.filter((p) => p.favorite && p.status === "active");

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">O</div>
            <span className="text-base font-bold tracking-tight text-gray-900">OSUNA</span>
          </Link>
          <button className="rounded p-1 text-gray-400 hover:bg-gray-100 md:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={() => setQuickCreate(true)}
            className="flex w-full items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Plus size={16} /> Crear
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon size={17} className={active ? "text-brand-600" : "text-gray-400"} />
                  {item.label}
                </span>
                {item.href === "/inbox" && unread > 0 && (
                  <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{unread}</span>
                )}
              </Link>
            );
          })}

          {favorites.length > 0 && (
            <div className="mt-4">
              <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Favoritos</div>
              {favorites.map((p) => (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    pathname === `/project/${p.id}` ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Star size={15} className="text-amber-400" fill="currentColor" />
                  <span className="truncate">{p.name}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4">
            <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Equipos y proyectos</div>
            {teams.map((team) => {
              const teamProjects = projects.filter((p) => p.teamId === team.id && p.status !== "archived");
              const isOpen = expanded[team.id];
              return (
                <div key={team.id}>
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [team.id]: !e[team.id] }))}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: team.color }} />
                    <span className="truncate">{team.name}</span>
                  </button>
                  {isOpen && (
                    <div className="ml-3 border-l border-gray-100 pl-1">
                      {teamProjects.map((p) => (
                        <Link
                          key={p.id}
                          href={`/project/${p.id}`}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                            pathname === `/project/${p.id}` ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          <Hash size={14} style={{ color: p.color }} />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      ))}
                      {teamProjects.length === 0 && (
                        <div className="px-2.5 py-1 text-xs text-gray-400">Sin proyectos</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-100 p-2">
          <Link
            href="/admin"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              pathname === "/admin" ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Settings size={16} className="text-gray-400" /> Administración
          </Link>
          <Link
            href="/automations"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              pathname === "/automations" ? "bg-brand-50 font-semibold text-brand-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Workflow size={16} className="text-gray-400" /> Automatizaciones
          </Link>
        </div>
      </aside>
    </>
  );
}
