"use client";

import { create } from "zustand";
import type { ID } from "./types";

type QuickTab = "task" | "project";

interface UIState {
  activeTaskId: ID | null;
  quickCreateOpen: boolean;
  quickCreateTab: QuickTab;
  searchOpen: boolean;
  openTask: (id: ID) => void;
  closeTask: () => void;
  setQuickCreate: (open: boolean) => void;
  openQuickCreate: (tab?: QuickTab) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  activeTaskId: null,
  quickCreateOpen: false,
  quickCreateTab: "task",
  searchOpen: false,
  openTask: (id) => set({ activeTaskId: id }),
  closeTask: () => set({ activeTaskId: null }),
  setQuickCreate: (open) => set({ quickCreateOpen: open }),
  openQuickCreate: (tab = "task") => set({ quickCreateOpen: true, quickCreateTab: tab }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
