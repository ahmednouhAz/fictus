import { z } from "zod";

// Mirrors recipientStorySchema in schemas/project.ts — duplicated rather
// than imported to avoid a circular import (project.ts imports the
// schemas below for its own chatList* fields).
const storySchema = z.enum(["none", "unseen", "seen"]);

export const chatPreviewKindSchema = z.enum([
  "text",
  "missedVideoCall",
  "missedAudioCall",
  "playButton",
]);

const noteProfileFieldsSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().optional(),
  story: storySchema.optional(),
  isCurrentUser: z.boolean().optional(),
  verified: z.boolean().optional(),
  // Set when this note's profile was picked from the saved recipient
  // library rather than typed in by hand.
  recipientId: z.string().optional(),
});

export const noteItemSchema = z.discriminatedUnion("type", [
  noteProfileFieldsSchema.extend({ type: z.literal("text"), content: z.string() }),
  noteProfileFieldsSchema.extend({
    type: z.literal("music"),
    musicTitle: z.string(),
    musicArtist: z.string(),
  }),
]);

export const meNoteContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({
    type: z.literal("music"),
    musicTitle: z.string(),
    musicArtist: z.string(),
  }),
]);

export const chatRowSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().optional(),
  story: storySchema.optional(),
  verified: z.boolean().optional(),
  recipientId: z.string().optional(),
  previewText: z.string(),
  time: z.string(),
  seen: z.boolean(),
  previewKind: chatPreviewKindSchema.optional(),
});

export type ChatPreviewKind = z.infer<typeof chatPreviewKindSchema>;
export type NoteItemData = z.infer<typeof noteItemSchema>;
export type MeNoteContent = z.infer<typeof meNoteContentSchema>;
export type ChatRowData = z.infer<typeof chatRowSchema>;
