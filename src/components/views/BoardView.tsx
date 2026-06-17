"use client";

import { useState } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MoreHorizontal, CheckCircle2, Circle, Diamond, ShieldCheck, MessageSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "@/components/Avatar";
import { PriorityBadge } from "@/components/ui";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task, ID } from "@/lib/types";

export function BoardView({ projectId, filterFn }: { projectId: ID; filterFn: (t: Task) => boolean }) {
  const sections = useStore((s) => s.sectionsOf(projectId));
  const tasks = useStore((s) => s.tasks);
  const moveTask = useStore((s) => s.moveTask);
  const addSection = useStore((s) => s.addSection);
  const createTask = useStore((s) => s.createTask);

  const [activeId, setActiveId] = useState<ID | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [sectionName, setSectionName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksBySection = (sectionId: ID) =>
    tasks
      .filter((t) => !t.parentId && t.memberships.some((m) => m.sectionId === sectionId) && filterFn(t))
      .sort((a, b) => a.order - b.order);

  const activeTask = tasks.find((t) => t.id === activeId);

  const findSection = (taskId: ID) => {
    const t = tasks.find((x) => x.id === taskId);
    return t?.memberships.find((m) => sections.some((s) => s.id === m.sectionId))?.sectionId;
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeSection = findSection(active.id as ID);
    const overSection = sections.some((s) => s.id === over.id) ? (over.id as ID) : findSection(over.id as ID);
    if (activeSection && overSection && activeSection !== overSection) {
      moveTask(active.id as ID, overSection);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const overSection = sections.some((s) => s.id === over.id) ? (over.id as ID) : findSection(over.id as ID);
    if (!overSection) return;
    const sectionTasks = tasksBySection(overSection);
    const overIndex = sectionTasks.findIndex((t) => t.id === over.id);
    moveTask(active.id as ID, overSection, overIndex >= 0 ? overIndex : sectionTasks.length);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as ID)}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-3 overflow-x-auto p-4">
        {sections.map((section) => (
          <Column key={section.id} id={section.id} name={section.name} tasks={tasksBySection(section.id)} onAdd={(name) => createTask({ name, projectId, sectionId: section.id })} />
        ))}

        <div className="w-72 shrink-0">
          {addingSection ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (sectionName.trim()) { addSection(projectId, sectionName.trim()); setSectionName(""); setAddingSection(false); } }}
              className="rounded-xl bg-gray-100 p-2"
            >
              <input autoFocus value={sectionName} onChange={(e) => setSectionName(e.target.value)} onBlur={() => setAddingSection(false)} placeholder="Nombre de la sección" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm" />
            </form>
          ) : (
            <button onClick={() => setAddingSection(true)} className="flex w-full items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
              <Plus size={16} /> Añadir sección
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <Card task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({ id, name, tasks, onAdd }: { id: ID; name: string; tasks: Task[]; onAdd: (name: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [adding, setAdding] = useState(false);
  const [name2, setName2] = useState("");

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100/80">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">{name}</h3>
          <span className="rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-500">{tasks.length}</span>
        </div>
        <button className="rounded p-0.5 text-gray-400 hover:bg-gray-200"><MoreHorizontal size={16} /></button>
      </div>

      <div ref={setNodeRef} className={cn("flex-1 space-y-2 overflow-y-auto px-2 pb-2 min-h-[60px] rounded-lg transition-colors", isOver && "bg-brand-100/40")}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => <SortableCard key={task.id} task={task} />)}
        </SortableContext>
      </div>

      <div className="p-2">
        {adding ? (
          <form onSubmit={(e) => { e.preventDefault(); if (name2.trim()) { onAdd(name2.trim()); setName2(""); } }}>
            <input autoFocus value={name2} onChange={(e) => setName2(e.target.value)} onBlur={() => setAdding(false)} placeholder="Nombre de la tarea" className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm" />
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200">
            <Plus size={15} /> Añadir tarea
          </button>
        )}
      </div>
    </div>
  );
}

function SortableCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card task={task} />
    </div>
  );
}

function Card({ task, overlay }: { task: Task; overlay?: boolean }) {
  const userById = useStore((s) => s.userById);
  const toggleComplete = useStore((s) => s.toggleComplete);
  const subtaskCount = useStore((s) => s.tasks.filter((t) => t.parentId === task.id).length);
  const openTask = useUI((s) => s.openTask);
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <div
      onClick={() => !overlay && openTask(task.id)}
      className={cn(
        "cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300",
        overlay && "rotate-2 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        <button onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }} className="mt-0.5">
          {task.completed ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300 hover:text-green-500" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {task.isMilestone && <Diamond size={12} className="shrink-0 text-purple-500" />}
            {task.isApproval && <ShieldCheck size={12} className="shrink-0 text-sky-500" />}
            <span className={cn("text-sm", task.completed ? "text-gray-400 line-through" : "text-gray-800")}>{task.name}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-6">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={cn("text-xs", overdue ? "font-medium text-red-600" : "text-gray-500")}>{formatDate(task.dueDate)}</span>
        )}
        {subtaskCount > 0 && <span className="text-xs text-gray-400">{subtaskCount} subt.</span>}
        {task.comments.length > 0 && <span className="flex items-center gap-0.5 text-xs text-gray-400"><MessageSquare size={11} />{task.comments.length}</span>}
        <div className="ml-auto"><Avatar user={userById(task.assigneeId)} size={22} /></div>
      </div>
    </div>
  );
}
