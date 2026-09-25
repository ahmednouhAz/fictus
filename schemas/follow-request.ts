import { z } from "zod";

// Which second line a row shows under its display name — a plain @username
// (the common case) or a mutual-followers line (stacked avatars + custom
// text, e.g. "followed by jane, sam and 12 others").
export const followRequestSubtitleModeSchema = z.enum(["username", "mutuals"]);

export const followRequestRowSchema = z.object({
  id: z.string(),
  // Bold name line — always shown, regardless of subtitleMode.
  displayName: z.string(),
  avatar: z.string().optional(),
  verified: z.boolean().optional(),
  // Set when this row's profile was picked from the saved recipient
  // library rather than typed in by hand — mirrors chatRowSchema's
  // recipientId in schemas/chat-list.ts.
  recipientId: z.string().optional(),
  // Undefined reads as "username" — the default/common case, not worth
  // forcing every row to carry the value explicitly.
  subtitleMode: followRequestSubtitleModeSchema.optional(),
  // subtitleMode === "username"
  username: z.string().optional(),
  // subtitleMode === "mutuals"
  mutualAvatars: z.array(z.string()).max(3).optional(),
  mutualsText: z.string().optional(),
});

export type FollowRequestSubtitleMode = z.infer<typeof followRequestSubtitleModeSchema>;
export type FollowRequestRow = z.infer<typeof followRequestRowSchema>;
