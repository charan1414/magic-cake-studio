import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PinState = {
  pincode: string;
  serviceable: boolean | null;
  areaLabel: string;
  distanceKm: number | null;
  set: (v: { pincode: string; serviceable: boolean; areaLabel?: string; distanceKm?: number | null }) => void;
  clear: () => void;
};

export const usePin = create<PinState>()(
  persist(
    (set) => ({
      pincode: "",
      serviceable: null,
      areaLabel: "",
      distanceKm: null,
      set: ({ pincode, serviceable, areaLabel = "", distanceKm = null }) =>
        set({ pincode, serviceable, areaLabel, distanceKm }),
      clear: () => set({ pincode: "", serviceable: null, areaLabel: "", distanceKm: null }),
    }),
    { name: "cim-pin" },
  ),
);
