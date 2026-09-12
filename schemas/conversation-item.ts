import { z } from "zod";

export const messageSenderSchema = z.enum(["me", "recipient"]);

export const dividerDaySchema = z.enum([
  "none",
  "yesterday",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
]);

export const callKindSchema = z.enum(["audio", "video"]);
export const callPhaseSchema = z.enum(["started", "ended"]);

export const photoItemSchema = z.object({
  id: z.string(),
  dataUrl: z.string(),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
});

export const messageItemSchema = z.object({
  kind: z.literal("message"),
  id: z.string(),
  sender: messageSenderSchema,
  type: z.enum(["text", "call", "photo", "reel", "story", "voice", "post"]),
  content: z.string(),
  timestamp: z.string(),
  reaction: z.string().max(8).optional(),
  callKind: callKindSchema.optional(),
  callPhase: callPhaseSchema.optional(),
  pairId: z.string().optional(),
  // Id of another message in the same conversation this one replies to.
  replyTo: z.string().optional(),
  edited: z.boolean().optional(),
  photos: z.array(photoItemSchema).optional(),
  reelThumbnail: photoItemSchema.optional(),
  reelOwnerUsername: z.string().optional(),
  reelOwnerAvatar: z.string().optional(),
  reelVerified: z.boolean().optional(),
  storyThumbnail: photoItemSchema.optional(),
  storyOwnerUsername: z.string().optional(),
  storyOwnerAvatar: z.string().optional(),
  storyVerified: z.boolean().optional(),
  voiceDurationSeconds: z.number().int().min(0).optional(),
  voiceBarHeights: z.array(z.number()).optional(),
  postThumbnail: photoItemSchema.optional(),
  postOwnerUsername: z.string().optional(),
  postOwnerAvatar: z.string().optional(),
  postVerified: z.boolean().optional(),
  postCaption: z.string().optional(),
  postIsCarousel: z.boolean().optional(),
});

export const meridiemSchema = z.enum(["AM", "PM"]);

export const dividerItemSchema = z.object({
  kind: z.literal("divider"),
  id: z.string(),
  day: dividerDaySchema,
  hour: z.number().int().min(1).max(12),
  minute: z.number().int().min(0).max(59),
  meridiem: meridiemSchema,
});

export const systemItemSchema = z.object({
  kind: z.literal("system"),
  id: z.string(),
  // Freeform text. `{name}` is substituted with the recipient's name at
  // render time; `**word**` renders bold. Both editor and every renderer
  // share the same parsing logic in lib/system-template.ts.
  template: z.string(),
});

export const conversationItemSchema = z.discriminatedUnion("kind", [
  messageItemSchema,
  dividerItemSchema,
  systemItemSchema,
]);

export type MessageSender = z.infer<typeof messageSenderSchema>;
export type DividerDay = z.infer<typeof dividerDaySchema>;
export type Meridiem = z.infer<typeof meridiemSchema>;
export type CallKind = z.infer<typeof callKindSchema>;
export type CallPhase = z.infer<typeof callPhaseSchema>;
export type PhotoItem = z.infer<typeof photoItemSchema>;
export type MessageItem = z.infer<typeof messageItemSchema>;
export type DividerItem = z.infer<typeof dividerItemSchema>;
export type SystemItem = z.infer<typeof systemItemSchema>;
export type ConversationItem = z.infer<typeof conversationItemSchema>;
