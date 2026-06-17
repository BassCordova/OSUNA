"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";
import { priorityMeta } from "@/lib/utils";

export function Badge({ children, color, bg, className }: { children: React.ReactNode; color?: string; bg?: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", className)}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  const m = priorityMeta[priority];
  return <Badge color={m.color} bg={m.bg}>{m.label}</Badge>;
}

export function Modal({
  open, onClose, children, title, wide,
}: { open: boolean; onClose: () => void; children: React.ReactNode; title?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onClose}>
      <div
        className={cn("mt-4 w-full rounded-xl bg-white shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Button({
  children, variant = "default", size = "md", className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "ghost" | "danger"; size?: "sm" | "md" }) {
  const variants = {
    default: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-3 py-1.5 text-sm" };
  return (
    <button
      className={cn("inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-gray-400">
      {icon}
      <div className="text-sm font-medium text-gray-500">{title}</div>
      {hint && <div className="text-xs">{hint}</div>}
    </div>
  );
}
