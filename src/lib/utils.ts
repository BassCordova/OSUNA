import { clsx, type ClassValue } from "clsx";
import type { Priority, HealthColor } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const dayMs = 86400000;

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / dayMs);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export function isOverdue(iso?: string, completed?: boolean): boolean {
  if (!iso || completed) return false;
  const d = new Date(iso.length <= 10 ? iso + "T23:59:59" : iso);
  return d.getTime() < Date.now();
}

export const priorityMeta: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: "Baja", color: "#64748b", bg: "#f1f5f9" },
  medium: { label: "Media", color: "#0369a1", bg: "#e0f2fe" },
  high: { label: "Alta", color: "#b45309", bg: "#fef3c7" },
  urgent: { label: "Urgente", color: "#b91c1c", bg: "#fee2e2" },
};

export const healthMeta: Record<HealthColor, { label: string; color: string; bg: string; dot: string }> = {
  on_track: { label: "En curso", color: "#15803d", bg: "#dcfce7", dot: "#22c55e" },
  at_risk: { label: "En riesgo", color: "#b45309", bg: "#fef3c7", dot: "#f59e0b" },
  off_track: { label: "Fuera de curso", color: "#b91c1c", bg: "#fee2e2", dot: "#ef4444" },
};

export function progressOf(tasks: { completed: boolean }[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}
