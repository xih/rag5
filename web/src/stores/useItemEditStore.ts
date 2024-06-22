import { create } from "zustand";

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

export default useItemEditStore;
