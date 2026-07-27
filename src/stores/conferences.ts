import { create } from "zustand";
import { type Conference } from "@/data/conferences";
import { supabase } from "@/lib/supabase";

type ConferencesState = {
  conferences: Conference[];
  loaded: boolean;
  addConference: (conference: Conference) => Promise<void>;
  updateConference: (id: string, updates: Partial<Conference>) => Promise<void>;
  deleteConference: (id: string) => Promise<void>;
  togglePickup: (id: string) => Promise<void>;
  loadFromSupabase: () => Promise<void>;
};

export const useConferences = create<ConferencesState>()((set, get) => ({
  conferences: [],
  loaded: false,

  loadFromSupabase: async () => {
    if (!supabase) {
      console.warn("[conferences] No Supabase client, using defaults");
      set({ loaded: true });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("conferences")
        .select("*")
        .order("date", { ascending: true });
      if (error) {
        console.error("[conferences] Supabase query error:", error.message);
        throw error;
      }
      console.log("[conferences] Loaded from Supabase:", data?.length, "rows");
      if (data && data.length > 0) {
        set({
          conferences: data.map((row) => ({
            id: row.id,
            name: row.name,
            location: row.location,
            date: row.date,
            endDate: row.end_date,
            pickupEnabled: row.pickup_enabled,
          })),
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch (e) {
      console.error("[conferences] loadFromSupabase failed:", e);
      set({ loaded: true });
    }
  },

  addConference: async (conference) => {
    set((state) => ({
      conferences: [...state.conferences, conference],
    }));
    if (supabase) {
      await supabase.from("conferences").upsert({
        id: conference.id,
        name: conference.name,
        location: conference.location,
        date: conference.date,
        end_date: conference.endDate,
        pickup_enabled: conference.pickupEnabled,
      });
    }
  },

  updateConference: async (id, updates) => {
    set((state) => ({
      conferences: state.conferences.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
    if (supabase) {
      const payload: Record<string, unknown> = { id };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.endDate !== undefined) payload.end_date = updates.endDate;
      if (updates.pickupEnabled !== undefined) payload.pickup_enabled = updates.pickupEnabled;
      await supabase.from("conferences").upsert(payload);
    }
  },

  deleteConference: async (id) => {
    set((state) => ({
      conferences: state.conferences.filter((c) => c.id !== id),
    }));
    if (supabase) {
      await supabase.from("conferences").delete().eq("id", id);
    }
  },

  togglePickup: async (id) => {
    const conf = get().conferences.find((c) => c.id === id);
    if (!conf) return;
    const newVal = !conf.pickupEnabled;
    set((state) => ({
      conferences: state.conferences.map((c) =>
        c.id === id ? { ...c, pickupEnabled: newVal } : c,
      ),
    }));
    if (supabase) {
      await supabase
        .from("conferences")
        .update({ pickup_enabled: newVal })
        .eq("id", id);
    }
  },
}));

export function getConferences(): Conference[] {
  return useConferences.getState().conferences;
}
