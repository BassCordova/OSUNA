"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import type { WorkspaceData } from "@/lib/workspace";

type SaveState = "idle" | "saving" | "saved" | "error";

// Carga el grafo de trabajo desde el backend al entrar y lo autoguarda
// (con debounce) ante cualquier cambio. Expone el estado de guardado por contexto simple.
export function WorkspaceSync({ children }: { children: React.ReactNode }) {
  const applyServerState = useStore((s) => s.applyServerState);
  const hydrated = useStore((s) => s.hydrated);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSerialized = useRef<string>("");

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workspace", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        applyServerState(json.data as WorkspaceData);
        lastSerialized.current = JSON.stringify(json.data);
      } catch (err) {
        console.error("[WorkspaceSync] carga inicial falló:", err);
        if (!cancelled) setError("No se pudo cargar tu workspace. Reintenta recargando la página.");
      }
    })();
    return () => { cancelled = true; };
  }, [applyServerState]);

  // Autoguardado ante cambios
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (!state.hydrated) return;
      const data = state.snapshot();
      const serialized = JSON.stringify(data);
      if (serialized === lastSerialized.current) return;
      lastSerialized.current = serialized;

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          window.dispatchEvent(new CustomEvent("osuna:save", { detail: "saving" as SaveState }));
          const res = await fetch("/api/workspace", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          window.dispatchEvent(new CustomEvent("osuna:save", { detail: "saved" as SaveState }));
        } catch (err) {
          console.error("[WorkspaceSync] guardado falló:", err);
          window.dispatchEvent(new CustomEvent("osuna:save", { detail: "error" as SaveState }));
        }
      }, 700);
    });
    return () => {
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm rounded-xl border border-red-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button onClick={() => location.reload()} className="mt-3 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
            Recargar
          </button>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-brand-600">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <span className="text-sm font-medium">Cargando tu workspace…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
