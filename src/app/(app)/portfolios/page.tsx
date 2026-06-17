"use client";

import Link from "next/link";
import { Briefcase, Hash } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui";
import { progressOf, healthMeta } from "@/lib/utils";

export default function PortfoliosPage() {
  const portfolios = useStore((s) => s.portfolios);
  const projects = useStore((s) => s.projects);
  const tasksOf = useStore((s) => s.tasksOf);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <Briefcase size={22} className="text-gray-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Portafolios</h1>
          <p className="text-sm text-gray-500">Visión agregada de proyectos para la dirección</p>
        </div>
      </div>

      <div className="space-y-5">
        {portfolios.map((pf) => {
          const pfProjects = pf.projectIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
          const allTasks = pfProjects.flatMap((p) => (p ? tasksOf(p.id) : []));
          const overallProgress = progressOf(allTasks);

          return (
            <div key={pf.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{pf.name}</h2>
                  <p className="text-xs text-gray-400">{pfProjects.length} proyectos · {overallProgress}% completado</p>
                </div>
                <div className="hidden w-40 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-2">Proyecto</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Progreso</th>
                    <th className="hidden px-4 py-2 sm:table-cell">Fecha fin</th>
                  </tr>
                </thead>
                <tbody>
                  {pfProjects.map((p) => {
                    if (!p) return null;
                    const pt = tasksOf(p.id);
                    const progress = progressOf(pt);
                    const health = p.statusUpdates[0]?.health;
                    return (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
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
                          ) : (
                            <span className="text-xs text-gray-400">Sin estado</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }} />
                            </div>
                            <span className="text-xs text-gray-500">{progress}%</span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-2.5 text-sm text-gray-500 sm:table-cell">
                          {p.endDate ? new Date(p.endDate + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
