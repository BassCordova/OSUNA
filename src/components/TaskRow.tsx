"use client";

import { CheckCircle2, Circle, Diamond, ShieldCheck, MessageSquare, GitBranch } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "./Avatar";
import { PriorityBadge } from "./ui";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/lib/types";

export function TaskRow({ task, showProject }: { task: Task; showProject?: boolean }) {
  const toggleComplete = useStore((s) => s.toggleComplete);
  const userById = useStore((s) => s.userById);
  const projects = useStore((s) => s.projects);
  const subtaskCount = useStore((s) => s.tasks.filter((t) => t.parentId === task.id).length);
  const openTask = useUI((s) => s.openTask);

  const project = showProject ? projects.find((p) => task.memberships.some((m) => m.projectId === p.id)) : undefined;
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <div
      onClick={() => openTask(task.id)}
      className="group flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 hover:bg-gray-50"
    >
      <button
        onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }}
        className="shrink-0"
      >
        {task.completed
          ? <CheckCircle2 size={18} className="text-green-500" />
          : <Circle size={18} className="text-gray-300 hover:text-green-500" />}
      </button>

      {task.isMilestone && <Diamond size={14} className="shrink-0 text-purple-500" />}
      {task.isApproval && <ShieldCheck size={14} className="shrink-0 text-sky-500" />}

      <span className={cn("flex-1 truncate text-sm", task.completed ? "text-gray-400 line-through" : "text-gray-800")}>
        {task.name}
      </span>

      {task.tags.map((tag) => (
        <span key={tag} className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 sm:inline">{tag}</span>
      ))}

      {subtaskCount > 0 && (
        <span className="hidden items-center gap-0.5 text-xs text-gray-400 sm:flex"><GitBranch size={12} /> {subtaskCount}</span>
      )}
      {task.comments.length > 0 && (
        <span className="hidden items-center gap-0.5 text-xs text-gray-400 sm:flex"><MessageSquare size={12} /> {task.comments.length}</span>
      )}

      {showProject && project && (
        <span className="hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium sm:flex" style={{ backgroundColor: project.color + "1a", color: project.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
          {project.name}
        </span>
      )}

      <PriorityBadge priority={task.priority} />

      {task.dueDate && (
        <span className={cn("hidden w-16 shrink-0 text-right text-xs sm:block", overdue ? "font-medium text-red-600" : "text-gray-500")}>
          {formatDate(task.dueDate)}
        </span>
      )}

      <Avatar user={userById(task.assigneeId)} size={24} className="shrink-0" />
    </div>
  );
}
