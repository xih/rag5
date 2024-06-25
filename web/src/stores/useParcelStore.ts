import { Database } from "@/generated/db";
import { create } from "zustand";

type ParcelDataRow = Database["public"]["Tables"]["parcels"]["Row"];

interface ParcelState {
  selectedBlklot: string | null;
  selectedParcelData: ParcelDataRow | null;
  setSelectedBlklot: (blklot: string | null) => void;
  setSelectedParcelData: (parcelData: ParcelDataRow | null) => void;
}

const useParcelStore = create<ParcelState>((set) => ({
  selectedBlklot: null,
  setSelectedBlklot: (blklot) => set({ selectedBlklot: blklot }),
  selectedParcelData: null,
  setSelectedParcelData: (parcelData) =>
    set({ selectedParcelData: parcelData }),
}));

export default useParcelStore;
