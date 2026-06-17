"use client";

import { useState } from "react";
import {
  Inbox as InboxIcon, AtSign, UserPlus, MessageSquare, RefreshCw, Clock, ShieldCheck, Check, Archive,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { Avatar } from "@/components/Avatar";
import { EmptyState, Button } from "@/components/ui";
import { relativeTime, cn } from "@/lib/utils";
import type { NotificationKind } from "@/lib/types";

const kindIcon: Record<NotificationKind, React.ReactNode> = {
  assigned: <UserPlus size={15} className="text-brand-500" />,
  mention: <AtSign size={15} className="text-sky-500" />,
  comment: <MessageSquare size={15} className="text-gray-400" />,
  status_change: <RefreshCw size={15} className="text-emerald-500" />,
  due_soon: <Clock size={15} className="text-amber-500" />,
  approval: <ShieldCheck size={15} className="text-purple-500" />,
};

export default function InboxPage() {
  const notifications = useStore((s) => s.notifications.filter((n) => !n.archived));
  const userById = useStore((s) => s.userById);
  const projects = useStore((s) => s.projects);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllRead);
  const archive = useStore((s) => s.archiveNotification);
  const openTask = useUI((s) => s.openTask);

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = notifications.filter((n) => filter === "all" || !n.read);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InboxIcon size={22} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900">Bandeja de entrada</h1>
        </div>
        <Button onClick={markAllRead} variant="ghost" size="sm"><Check size={14} /> Marcar todo leído</Button>
      </div>

      <div className="mb-3 flex gap-1 rounded-lg bg-gray-100 p-0.5 text-sm w-fit">
        <button onClick={() => setFilter("all")} className={cn("rounded-md px-3 py-1 font-medium", filter === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}>Todas</button>
        <button onClick={() => setFilter("unread")} className={cn("rounded-md px-3 py-1 font-medium", filter === "unread" ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}>Sin leer</button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<InboxIcon size={40} />} title="Todo al día" hint="No tienes notificaciones nuevas." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {list.map((n) => {
            const actor = userById(n.actorId);
            const project = projects.find((p) => p.id === n.projectId);
            return (
              <div
                key={n.id}
                onClick={() => { markRead(n.id); if (n.taskId) openTask(n.taskId); }}
                className={cn("group flex cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50", !n.read && "bg-brand-50/40")}
              >
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                {n.read && <span className="mt-2 h-2 w-2 shrink-0" />}
                <Avatar user={actor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{actor?.name}</span> {n.text}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                    {kindIcon[n.kind]}
                    {project && <span>{project.name}</span>}
                    <span>· {relativeTime(n.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); archive(n.id); }}
                  className="rounded p-1 text-gray-300 opacity-0 hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100"
                  title="Archivar"
                >
                  <Archive size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
