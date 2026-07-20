import { create } from 'zustand';
import type { BladeHandleType, CatalogProduct } from '@ttsetupbuilder/types';

export type BuilderSlot = 'blade' | 'fh' | 'bh' | 'player';

/** Zoom relativo al “cover”: 1 = llena el marco, &lt;1 aleja, &gt;1 acerca. */
export const PLAYER_PHOTO_ZOOM_MIN = 0.55;
export const PLAYER_PHOTO_ZOOM_MAX = 2;
export const PLAYER_PHOTO_ZOOM_DEFAULT = 0.85;

type BuilderState = {
  blade: CatalogProduct | null;
  /** Tomada: FL (acampanada) o ST (recta) */
  bladeHandle: BladeHandleType | null;
  /** Goma derecha (FH) */
  fh: CatalogProduct | null;
  /** Goma izquierda (BH) */
  bh: CatalogProduct | null;
  /** Object URL de la foto del jugador (solo en el cliente; no se sube). */
  playerPhotoUrl: string | null;
  playerName: string;
  /** 1 = cover del marco; menor = más foto visible. */
  playerPhotoZoom: number;
  /** Pan horizontal/vertical en [-1, 1] dentro del overflow del zoom. */
  playerPhotoOffsetX: number;
  playerPhotoOffsetY: number;
  activeSlot: BuilderSlot;
  setActiveSlot: (slot: BuilderSlot) => void;
  selectProduct: (slot: 'blade' | 'fh' | 'bh', product: CatalogProduct) => void;
  setBladeHandle: (handle: BladeHandleType) => void;
  setPlayerPhoto: (file: File) => void;
  setPlayerName: (name: string) => void;
  setPlayerPhotoZoom: (zoom: number) => void;
  setPlayerPhotoOffset: (x: number, y: number) => void;
  clearPlayerPhoto: () => void;
  clearSlot: (slot: 'blade' | 'fh' | 'bh') => void;
  reset: () => void;
};

function defaultHandleFor(blade: CatalogProduct): BladeHandleType | null {
  const types = blade.handleTypes;
  if (!types || types.length === 0) return null;
  if (types.length === 1) return types[0]!;
  return null;
}

function revokeIfNeeded(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Client draft for racket composition (ADR-005 / ADR-011). */
export const useBuilderStore = create<BuilderState>((set, get) => ({
  blade: null,
  bladeHandle: null,
  fh: null,
  bh: null,
  playerPhotoUrl: null,
  playerName: '',
  playerPhotoZoom: PLAYER_PHOTO_ZOOM_DEFAULT,
  playerPhotoOffsetX: 0,
  playerPhotoOffsetY: 0,
  activeSlot: 'blade',
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  selectProduct: (slot, product) =>
    set((state) => {
      if (slot === 'blade') {
        const handle = defaultHandleFor(product);
        return {
          blade: product,
          bladeHandle: handle,
          activeSlot: handle ? ('fh' as const) : state.activeSlot,
        };
      }
      if (slot === 'fh') {
        return { fh: product, activeSlot: 'bh' as const };
      }
      return { bh: product, activeSlot: 'player' as const };
    }),
  setBladeHandle: (handle) => set({ bladeHandle: handle, activeSlot: 'fh' }),
  setPlayerPhoto: (file) => {
    revokeIfNeeded(get().playerPhotoUrl);
    set({
      playerPhotoUrl: URL.createObjectURL(file),
      playerPhotoZoom: PLAYER_PHOTO_ZOOM_DEFAULT,
      playerPhotoOffsetX: 0,
      playerPhotoOffsetY: 0,
      activeSlot: 'player',
    });
  },
  setPlayerName: (name) => set({ playerName: name }),
  setPlayerPhotoZoom: (zoom) =>
    set({
      playerPhotoZoom: clamp(zoom, PLAYER_PHOTO_ZOOM_MIN, PLAYER_PHOTO_ZOOM_MAX),
    }),
  setPlayerPhotoOffset: (x, y) =>
    set({
      playerPhotoOffsetX: clamp(x, -1, 1),
      playerPhotoOffsetY: clamp(y, -1, 1),
    }),
  clearPlayerPhoto: () => {
    revokeIfNeeded(get().playerPhotoUrl);
    set({
      playerPhotoUrl: null,
      playerPhotoZoom: PLAYER_PHOTO_ZOOM_DEFAULT,
      playerPhotoOffsetX: 0,
      playerPhotoOffsetY: 0,
    });
  },
  clearSlot: (slot) =>
    set(() => {
      if (slot === 'blade') return { blade: null, bladeHandle: null };
      if (slot === 'fh') return { fh: null };
      return { bh: null };
    }),
  reset: () => {
    revokeIfNeeded(get().playerPhotoUrl);
    set({
      blade: null,
      bladeHandle: null,
      fh: null,
      bh: null,
      playerPhotoUrl: null,
      playerName: '',
      playerPhotoZoom: PLAYER_PHOTO_ZOOM_DEFAULT,
      playerPhotoOffsetX: 0,
      playerPhotoOffsetY: 0,
      activeSlot: 'blade',
    });
  },
}));
