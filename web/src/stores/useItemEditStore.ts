import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ItemEditState {
  granteeEditIndex: number | null;
  grantorEditIndex: number | null;
  setGranteeEditIndex: (index: number | null) => void;
  setGrantorEditIndex: (index: number | null) => void;
  resetEditIndices: () => void;
}

const useItemEditStore = create<ItemEditState>((set) => ({
  granteeEditIndex: null,
  grantorEditIndex: null,
  setGranteeEditIndex: (index) => set({ granteeEditIndex: index }),
  setGrantorEditIndex: (index) => set({ grantorEditIndex: index }),
  resetEditIndices: () =>
    set({ granteeEditIndex: null, grantorEditIndex: null }),
}));

interface EditState {
  grantorNames: string[];
  granteeNames: string[];
  originalGrantorNames: string[];
  originalGranteeNames: string[];
  setGrantorName: (index: number, name: string) => void;
  setGranteeName: (index: number, name: string) => void;
  revertGrantorName: (index: number, originalName: string) => void;
  revertGranteeName: (index: number, originalName: string) => void;
  initializeGrantorNames: (names: string[]) => void;
  initializeGranteeNames: (names: string[]) => void;
  initializeOriginalGrantorNames: (names: string[]) => void;
  initializeOriginalGranteeNames: (names: string[]) => void;
}

export const useEditStore = create<EditState>((set) => ({
  grantorNames: [],
  granteeNames: [],
  originalGrantorNames: [],
  originalGranteeNames: [],
  initializeGrantorNames: (names) => set({ grantorNames: names }),
  initializeGranteeNames: (names) => set({ granteeNames: names }),
  initializeOriginalGrantorNames: (names) =>
    set({ originalGrantorNames: names }),
  initializeOriginalGranteeNames: (names) =>
    set({ originalGranteeNames: names }),
  setGrantorName: (index, name) =>
    set((state) => {
      const newNames = [...state.grantorNames];
      newNames[index] = name;
      return { grantorNames: newNames };
    }),
  setGranteeName: (index, name) =>
    set((state) => {
      const newNames = [...state.granteeNames];
      newNames[index] = name;
      return { granteeNames: newNames };
    }),
  revertGrantorName: (index, originalName) =>
    set((state) => {
      const newNames = [...state.grantorNames];
      newNames[index] = originalName;
      return { grantorNames: newNames };
    }),
  revertGranteeName: (index, originalName) =>
    set((state) => {
      const newNames = [...state.granteeNames];
      newNames[index] = originalName;
      return { granteeNames: newNames };
    }),
}));

export default useItemEditStore;
