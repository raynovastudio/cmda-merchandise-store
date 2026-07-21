import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  conferences as baseConferences,
  type Conference,
} from "@/data/conferences";

type ConferencesState = {
  conferences: Conference[];
  addConference: (conference: Conference) => void;
  updateConference: (id: string, updates: Partial<Conference>) => void;
  deleteConference: (id: string) => void;
  togglePickup: (id: string) => void;
};

export const useConferences = create<ConferencesState>()(
  persist(
    (set) => ({
      conferences: baseConferences,

      addConference: (conference) =>
        set((state) => ({
          conferences: [...state.conferences, conference],
        })),

      updateConference: (id, updates) =>
        set((state) => ({
          conferences: state.conferences.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      deleteConference: (id) =>
        set((state) => ({
          conferences: state.conferences.filter((c) => c.id !== id),
        })),

      togglePickup: (id) =>
        set((state) => ({
          conferences: state.conferences.map((c) =>
            c.id === id ? { ...c, pickupEnabled: !c.pickupEnabled } : c,
          ),
        })),
    }),
    { name: "cmda-conferences" },
  ),
);

export function getConferences(): Conference[] {
  return useConferences.getState().conferences;
}
