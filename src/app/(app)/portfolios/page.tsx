"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Hash, Plus, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, Button, Modal, EmptyState } from "@/components/ui";
import { progressOf, healthMeta } from "@/lib/utils";
import type { ID } from "@/lib/types";

export default function PortfoliosPage() {
  const portfolios = useStore((s) => s.portfolios);
  const projects = useStore((s) => s.projects);
  const tasksOf = useStore((s) => s.tasksOf);
  const createPortfolio = useStore((s) => s.createPortfolio);
  const updatePortfolio = useStore((s) => s.updatePortfolio);
  const deletePortfolio = useStore((s) => s.deletePortfolio);
  const addProjectToPortfolio = useStore((s) => s.addProjectToPortfolio);
  const removeProjectFromPortfolio = useStore((s) => s.removeProjectFromPortfolio);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [menuOpen, setMenuOpen] = useState<ID | null>(null);
  const [renaming, setRenaming] = useState<ID | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [addingTo, setAddingTo] = useState<ID | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase size={22} className="text-gray-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Portafolios</h1>
            <p className="text-sm text-gray-500">Visión agregada de proyectos para la dirección</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}><Plus size={15} /> Nuevo portafolio</Button>
      </div>

      {portfolios.length === 0 && (
        <EmptyState icon={<Briefcase size={40} />} title="Sin portafolios todavía" hint="Crea uno para agrupar proyectos y ver su avance conjunto." />
      )}

      <div className="space-y-5">
        {portfolios.map((pf) => {
          const pfProjects = pf.projectIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
          const allTasks = pfProjects.flatMap((p) => (p ? tasksOf(p.id) : []));
          const overallProgress = progressOf(allTasks);
          const available = projects.filter((p) => p.status === "active" && !pf.projectIds.includes(p.id));

          return (
            <div key={pf.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="min-w-0 flex-1">
                  {renaming === pf.id ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); if (renameValue.trim()) updatePortfolio(pf.id, { name: renameValue.trim() }); setRenaming(null); }}
                      className="flex items-center gap-2"
                    >
                      <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="rounded-md border border-gray-200 px-2 py-1 text-sm" />
                      <Button size="sm" variant="primary" type="submit"><Check size={14} /></Button>
                      <Button size="sm" type="button" onClick={() => setRenaming(null)}><X size={14} /></Button>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-base font-semibold text-gray-900">{pf.name}</h2>
                      <p className="text-xs text-gray-400">{pfProjects.length} proyectos · {overallProgress}% completado</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden w-40 sm:block">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${overallProgress}%` }} />
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === pf.id ? null : pf.id)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen === pf.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          <button onClick={() => { setRenaming(pf.id); setRenameValue(pf.name); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil size={14} className="text-gray-400" /> Renombrar
                          </button>
                          <button onClick={() => { if (confirm(`¿Eliminar el portafolio "${pf.name}"?`)) deletePortfolio(pf.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {pfProjects.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-4 py-2">Proyecto</th>
                      <th className="px-4 py-2">Estado</th>
                      <th className="px-4 py-2">Progreso</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pfProjects.map((p) => {
                      if (!p) return null;
                      const pt = tasksOf(p.id);
                      const progress = progressOf(pt);
                      const health = p.statusUpdates[0]?.health;
                      return (
                        <tr key={p.id} className="group border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <Link href={`/project/${p.id}`} className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-brand-600">
                              <Hash size={15} style={{ color: p.color }} /> {p.name}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5">
                            {health ? (
                              <Badge color={healthMeta[health].color} bg={healthMeta[health].bg}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: healthMeta[health].dot }} /> {healthMeta[health].label}
                              </Badge>
                            ) : <span className="text-xs text-gray-400">Sin estado</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                                <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }} />
                              </div>
                              <span className="text-xs text-gray-500">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button onClick={() => removeProjectFromPortfolio(pf.id, p.id)} title="Quitar del portafolio" className="rounded p-1 text-gray-300 opacity-0 hover:bg-gray-200 hover:text-red-500 group-hover:opacity-100">
                              <X size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-4 text-sm text-gray-400">Aún no hay proyectos en este portafolio.</p>
              )}

              <div className="border-t border-gray-100 p-2">
                {addingTo === pf.id ? (
                  <select
                    autoFocus
                    onChange={(e) => { if (e.target.value) addProjectToPortfolio(pf.id, e.target.value); setAddingTo(null); }}
                    onBlur={() => setAddingTo(null)}
                    className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                  >
                    <option value="">Selecciona un proyecto…</option>
                    {available.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                ) : (
                  <button onClick={() => setAddingTo(pf.id)} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:text-gray-300" disabled={available.length === 0}>
                    <Plus size={14} /> {available.length === 0 ? "Todos los proyectos ya están aquí" : "Añadir proyecto"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={creating} onClose={() => { setCreating(false); setNewName(""); }} title="Nuevo portafolio">
        <form
          onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { createPortfolio({ name: newName.trim() }); setNewName(""); setCreating(false); } }}
          className="space-y-3 px-5 pb-5 pt-3"
        >
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del portafolio" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200" />
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => { setCreating(false); setNewName(""); }}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!newName.trim()}>Crear</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
