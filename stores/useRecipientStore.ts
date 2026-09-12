import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedRecipient, SavedRecipientFields } from "@/schemas/recipient";

type RecipientState = {
  recipients: SavedRecipient[];
  hasHydrated: boolean;
  // Creates a new saved recipient, or updates the one at `id` if it still
  // exists — the "Save profile" button doesn't need to know which case
  // it's in, it just always gets back the up-to-date record.
  upsertRecipient: (id: string | null | undefined, fields: SavedRecipientFields) => SavedRecipient;
  updateRecipient: (id: string, fields: Partial<SavedRecipientFields>) => void;
  deleteRecipient: (id: string) => void;
};

export const useRecipientStore = create<RecipientState>()(
  persist(
    (set, get) => ({
      recipients: [],
      hasHydrated: false,

      upsertRecipient: (id, fields) => {
        const now = new Date().toISOString();
        const existing = id ? get().recipients.find((r) => r.id === id) : undefined;
        if (existing) {
          const updated: SavedRecipient = { ...existing, ...fields, updatedAt: now };
          set((state) => ({
            recipients: state.recipients.map((r) => (r.id === existing.id ? updated : r)),
          }));
          return updated;
        }
        const created: SavedRecipient = {
          id: crypto.randomUUID(),
          ...fields,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ recipients: [created, ...state.recipients] }));
        return created;
      },

      updateRecipient: (id, fields) =>
        set((state) => ({
          recipients: state.recipients.map((r) =>
            r.id === id ? { ...r, ...fields, updatedAt: new Date().toISOString() } : r,
          ),
        })),

      deleteRecipient: (id) =>
        set((state) => ({ recipients: state.recipients.filter((r) => r.id !== id) })),
    }),
    {
      name: "sus-recipients",
      // Rehydrated manually by <StoreHydration> after mount, same reason
      // as useProjectStore: keeps the first client render matching the
      // server render (empty) so there's no hydration mismatch.
      skipHydration: true,
      partialize: (state) => ({ recipients: state.recipients }),
      version: 1,
    },
  ),
);
