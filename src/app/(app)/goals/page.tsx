"use client";

import { useState } from "react";
import { Target, Hash, Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { Badge, Button, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Goal, GoalLevel, ID } from "@/lib/types";

const levelMeta: Record<GoalLevel, { label: string; color: string; bg: string }> = {
  organization: { label: "Organización", color: "#6b46e5", bg: "#f4f1fe" },
  team: { label: "Equipo", color: "#0369a1", bg: "#e0f2fe" },
  individual: { label: "Individual", color: "#15803d", bg: "#dcfce7" },
};

export default function GoalsPage() {
  const goals = useStore((s) => s.goals);
  const projects = useStore((s) => s.projects);
  const userById = useStore((s) => s.userById);
  const updateGoalProgress = useStore((s) => s.updateGoalProgress);
  const createGoal = useStore((s) => s.createGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);

  const [editGoal, setEditGoal] = useState<ID | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<GoalLevel>("team");
  const [metricLabel, setMetricLabel] = useState("");
  const [targetValue, setTargetValue] = useState("100");
  const [unit, setUnit] = useState("%");

  const topGoals = goals.filter((g) => !g.parentId);
  const childrenOf = (id: string) => goals.filter((g) => g.parentId === id);

  const renderGoal = (goal: Goal, depth = 0) => {
    const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
    const owner = userById(goal.ownerId);
    const linked = goal.linkedProjectIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
    const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#f59e0b" : "#ef4444";

    return (
      <div key={goal.id} style={{ marginLeft: depth * 24 }}>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge color={levelMeta[goal.level].color} bg={levelMeta[goal.level].bg}>{levelMeta[goal.level].label}</Badge>
                <span className="text-xs text-gray-400">{goal.period}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900">{goal.title}</h3>
              {goal.description && <p className="mt-0.5 text-sm text-gray-500">{goal.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {owner && <span className="flex items-center gap-1.5 text-xs text-gray-500"><Avatar user={owner} size={18} /> {owner.name}</span>}
                {linked.map((p) => p && (
                  <span key={p.id} className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: p.color + "1a", color: p.color }}>
                    <Hash size={10} /> {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              <div className="w-28 text-right">
                <div className="text-2xl font-bold" style={{ color }}>{pct}%</div>
                <div className="text-xs text-gray-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</div>
              </div>
              <div className="flex flex-col">
                <button onClick={() => setEditGoal(goal.id)} className="rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-600" title="Editar"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm(`¿Eliminar el objetivo "${goal.title}"?`)) deleteGoal(goal.id); }} className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-600" title="Eliminar"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <input
              type="range" min={0} max={goal.targetValue} step={goal.targetValue / 100} value={goal.currentValue}
              onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
              className="w-24 accent-brand-600"
              title="Ajustar progreso"
            />
          </div>
        </div>
        {childrenOf(goal.id).length > 0 && (
          <div className="mt-2 space-y-2 border-l-2 border-gray-100 pl-2">
            {childrenOf(goal.id).map((c) => renderGoal(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target size={22} className="text-gray-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Objetivos</h1>
            <p className="text-sm text-gray-500">Metas de la organización y equipos, con sub-objetivos vinculados</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}><Plus size={15} /> Nuevo objetivo</Button>
      </div>
      <div className="space-y-3">
        {topGoals.map((g) => renderGoal(g))}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo objetivo">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createGoal({ title: title.trim(), level, metricLabel: metricLabel.trim() || undefined, targetValue: Number(targetValue) || 100, unit: unit.trim() || "%" });
            setTitle(""); setMetricLabel(""); setTargetValue("100"); setUnit("%"); setCreating(false);
          }}
          className="space-y-3 px-5 pb-5 pt-3"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Título</span>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="modal-input" placeholder="Ej. Crecer ingresos 30%" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Nivel</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as GoalLevel)} className="modal-input">
                <option value="organization">Organización</option>
                <option value="team">Equipo</option>
                <option value="individual">Individual</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Métrica</span>
              <input value={metricLabel} onChange={(e) => setMetricLabel(e.target.value)} className="modal-input" placeholder="Ej. Videos entregados" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Meta</span>
              <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="modal-input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Unidad</span>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} className="modal-input" placeholder="%, videos, x…" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!title.trim()}>Crear objetivo</Button>
          </div>
        </form>
      </Modal>

      <EditGoalModal goalId={editGoal} onClose={() => setEditGoal(null)} />
    </div>
  );
}

function EditGoalModal({ goalId, onClose }: { goalId: ID | null; onClose: () => void }) {
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId));
  const projects = useStore((s) => s.projects);
  const updateGoal = useStore((s) => s.updateGoal);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("100");
  const [currentValue, setCurrentValue] = useState("0");
  const [unit, setUnit] = useState("%");
  const [linked, setLinked] = useState<string[]>([]);
  const [lastId, setLastId] = useState<ID | null>(null);

  if (goal && goal.id !== lastId) {
    setLastId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description ?? "");
    setTargetValue(String(goal.targetValue));
    setCurrentValue(String(goal.currentValue));
    setUnit(goal.unit);
    setLinked(goal.linkedProjectIds);
  }
  if (!goal) return null;

  return (
    <Modal open onClose={() => { onClose(); setLastId(null); }} title="Editar objetivo">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateGoal(goal.id, {
            title: title.trim() || goal.title, description: description.trim() || undefined,
            targetValue: Number(targetValue) || goal.targetValue, currentValue: Number(currentValue) || 0,
            unit: unit.trim() || goal.unit, linkedProjectIds: linked,
          });
          onClose(); setLastId(null);
        }}
        className="space-y-3 px-5 pb-5 pt-3"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Título</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus className="modal-input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Descripción</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="modal-input resize-none" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Actual</span>
            <input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="modal-input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Meta</span>
            <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="modal-input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Unidad</span>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className="modal-input" />
          </label>
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">Proyectos que contribuyen</span>
          <div className="flex flex-wrap gap-1.5">
            {projects.map((p) => {
              const on = linked.includes(p.id);
              return (
                <button
                  key={p.id} type="button"
                  onClick={() => setLinked((ids) => on ? ids.filter((x) => x !== p.id) : [...ids, p.id])}
                  className={cn("flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:bg-gray-50")}
                >
                  <Hash size={11} style={{ color: p.color }} /> {p.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => { onClose(); setLastId(null); }}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}
