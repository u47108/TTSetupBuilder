import { create } from 'zustand';

type UiState = {
  isNavOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
};

/** Client UI state skeleton (ADR-005). Catalog data belongs in TanStack Query. */
export const useUiStore = create<UiState>((set) => ({
  isNavOpen: false,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
}));
