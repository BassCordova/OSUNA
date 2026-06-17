"use client";

import { useState } from "react";
import { Workflow, Zap, ArrowRight, FileInput, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { Modal, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { RuleTriggerType, RuleActionType, ID } from "@/lib/types";

const triggerLabel: Record<RuleTriggerType, string> = {
  task_created: "Cuando se crea una tarea",
  moved_to_section: "Cuando se mueve a una sección",
  task_completed: "Cuando se completa una tarea",
  field_changed: "Cuando cambia un campo",
};
const actionLabel: Record<RuleActionType, string> = {
  assign_to: "Asignar a",
  move_to_section: "Mover a sección",
  set_field: "Cambiar campo",
  add_comment: "Comentar",
  set_priority: "Cambiar prioridad",
};

export default function AutomationsPage() {
  const rules = useStore((s) => s.rules);
  const projects = useStore((s) => s.projects);
  const sections = useStore((s) => s.sections);
  const userById = useStore((s) => s.userById);
  const toggleRule = useStore((s) => s.toggleRule);
  const forms = useStore((s) => s.forms);

  const [activeForm, setActiveForm] = useState<ID | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <Workflow size={22} className="text-gray-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Automatizaciones</h1>
          <p className="text-sm text-gray-500">Reglas disparador → acción y formularios de intake</p>
        </div>
      </div>

      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Zap size={15} className="text-amber-500" /> Reglas</h2>
      <div className="space-y-3">
        {rules.map((rule) => {
          const project = projects.find((p) => p.id === rule.projectId);
          const triggerSection = rule.trigger.sectionId ? sections.find((s) => s.id === rule.trigger.sectionId) : null;
          return (
            <div key={rule.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{rule.name}</h3>
                    {project && <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: project.color + "1a", color: project.color }}>{project.name}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <Badge color="#b45309" bg="#fef3c7">{triggerLabel[rule.trigger.type]}{triggerSection ? `: ${triggerSection.name}` : ""}</Badge>
                    {rule.actions.map((a, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <ArrowRight size={12} className="text-gray-300" />
                        <Badge color="#0369a1" bg="#e0f2fe">
                          {actionLabel[a.type]}
                          {a.userId ? ` ${userById(a.userId)?.name.split(" ")[0]}` : ""}
                          {a.priority ? ` ${a.priority}` : ""}
                          {a.sectionId ? ` ${sections.find((s) => s.id === a.sectionId)?.name ?? ""}` : ""}
                        </Badge>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", rule.enabled ? "bg-brand-600" : "bg-gray-300")}
                  title={rule.enabled ? "Activa" : "Inactiva"}
                >
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", rule.enabled ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-2 mt-6 flex items-center gap-1.5 text-sm font-semibold text-gray-700"><FileInput size={15} className="text-emerald-500" /> Formularios de intake</h2>
      <div className="space-y-3">
        {forms.map((form) => {
          const project = projects.find((p) => p.id === form.projectId);
          return (
            <div key={form.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{form.title}</h3>
                <p className="text-xs text-gray-500">{form.description}</p>
                <p className="mt-1 text-[11px] text-gray-400">Genera tareas en: {project?.name}</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setActiveForm(form.id)}>Abrir formulario</Button>
            </div>
          );
        })}
      </div>

      <FormModal formId={activeForm} onClose={() => setActiveForm(null)} />
    </div>
  );
}

function FormModal({ formId, onClose }: { formId: ID | null; onClose: () => void }) {
  const form = useStore((s) => s.forms.find((f) => f.id === formId));
  const submitForm = useStore((s) => s.submitForm);
  const [values, setValues] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!form) return null;

  const submit = () => {
    submitForm(form.id, values);
    setDone(true);
    setTimeout(() => { setDone(false); setValues({}); onClose(); }, 1400);
  };

  return (
    <Modal open onClose={onClose} title={form.title}>
      <div className="px-5 pb-5 pt-3">
        {done ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"><Send size={22} /></div>
            <p className="text-sm font-medium text-gray-700">¡Solicitud enviada!</p>
            <p className="text-xs text-gray-400">Se creó una tarea y se dispararon las reglas configuradas.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-3">
            {form.description && <p className="text-sm text-gray-500">{form.description}</p>}
            {form.fields.map((f) => (
              <label key={f.id} className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>
                {f.type === "textarea" ? (
                  <textarea required={f.required} value={values[f.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200" />
                ) : f.type === "select" ? (
                  <select required={f.required} value={values[f.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <option value="">Selecciona…</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input required={f.required} value={values[f.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200" />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary">Enviar solicitud</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
