import { create } from 'zustand';
import type { CatalogProduct } from '@ttsetupbuilder/types';

export type BuilderSlot = 'blade' | 'fh' | 'bh';

type BuilderState = {
  blade: CatalogProduct | null;
  /** Goma derecha (FH) */
  fh: CatalogProduct | null;
  /** Goma izquierda (BH) */
  bh: CatalogProduct | null;
  activeSlot: BuilderSlot;
  setActiveSlot: (slot: BuilderSlot) => void;
  selectProduct: (slot: BuilderSlot, product: CatalogProduct) => void;
  clearSlot: (slot: BuilderSlot) => void;
  reset: () => void;
};

/** Client draft for racket composition (ADR-005 / ADR-011). */
export const useBuilderStore = create<BuilderState>((set) => ({
  blade: null,
  fh: null,
  bh: null,
  activeSlot: 'blade',
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  selectProduct: (slot, product) =>
    set((state) => {
      const next =
        slot === 'blade'
          ? { blade: product }
          : slot === 'fh'
            ? { fh: product }
            : { bh: product };
      // Advance palette focus in order: madero → derecha → izquierda
      const activeSlot: BuilderSlot =
        slot === 'blade' ? 'fh' : slot === 'fh' ? 'bh' : state.activeSlot;
      return { ...next, activeSlot };
    }),
  clearSlot: (slot) =>
    set(() =>
      slot === 'blade' ? { blade: null } : slot === 'fh' ? { fh: null } : { bh: null },
    ),
  reset: () => set({ blade: null, fh: null, bh: null, activeSlot: 'blade' }),
}));
