"use client";

import { create } from "zustand";
import type { ID } from "./types";

interface UIState {
  activeTaskId: ID | null;
  quickCreateOpen: boolean;
  searchOpen: boolean;
  openTask: (id: ID) => void;
  closeTask: () => void;
  setQuickCreate: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  activeTaskId: null,
  quickCreateOpen: false,
  searchOpen: false,
  openTask: (id) => set({ activeTaskId: id }),
  closeTask: () => set({ activeTaskId: null }),
  setQuickCreate: (open) => set({ quickCreateOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
