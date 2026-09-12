import { z } from "zod";
import { conversationItemSchema, meridiemSchema } from "@/schemas/conversation-item";
import { noteItemSchema, meNoteContentSchema, chatRowSchema } from "@/schemas/chat-list";

export const platformSchema = z.enum(["instagram"]);
// Which generator this project belongs to. Absent/undefined means
// "conversation" — every project created before this field existed is a
// conversation, so that's the implicit default rather than requiring a
// migration to backfill it.
export const projectKindSchema = z.enum(["conversation", "chatList"]);
export const conversationKindSchema = z.enum(["normal", "messageRequest"]);
export const conversationThemeSchema = z.enum(["dark", "light"]);
export const deviceSchema = z.enum(["ios", "android", "desktop"]);
export const recipientStorySchema = z.enum(["none", "unseen", "seen"]);
export const profileCardRelationshipSchema = z.enum([
  "mutual",
  "followsYou",
  "followedSince",
  "notMutual",
]);

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  platform: platformSchema,
  kind: projectKindSchema.optional(),
  // A message request only ever contains the recipient's own messages
  // (you haven't accepted/replied yet) and shows an accept/block/delete
  // bar instead of the normal composer — see InstagramMessageRequestBar.
  conversationKind: conversationKindSchema.optional(),
  // Overall dark/light look of the chat itself — background, recipient
  // bubbles, header text/icons. "Me" bubbles and other blue accents stay
  // blue regardless.
  theme: conversationThemeSchema.optional(),
  // Reserved for Milestone 6's reusable Recipient library. Until then,
  // `recipientName` below is the lightweight project-scoped stand-in.
  recipientId: z.string().nullable(),
  recipientName: z.string(),
  // Accounts without a display name show their username in its place
  // instead. This hides recipientName from display without discarding it,
  // so toggling back on restores exactly what was typed before.
  recipientNameHidden: z.boolean().optional(),
  recipientUsername: z.string().optional(),
  recipientAvatar: z.string().optional(),
  recipientVerified: z.boolean().optional(),
  recipientStory: recipientStorySchema.optional(),
  // Big centered profile summary shown at the very top of the chat —
  // matches Instagram's own "you're at the start of your conversation"
  // profile card.
  profileCardEnabled: z.boolean().optional(),
  profileCardFollowers: z.string().optional(),
  profileCardPosts: z.number().int().min(0).optional(),
  profileCardRelationship: profileCardRelationshipSchema.optional(),
  profileCardFollowedSinceYear: z.number().int().optional(),
  profileCardNote: z.string().optional(),
  profileCardShowViewProfileButton: z.boolean().optional(),
  device: deviceSchema.optional(),
  // Whether the status bar row (time/signal/battery) renders at all —
  // some screenshots look cleaner without it.
  statusBarVisible: z.boolean().optional(),
  statusBarHour: z.number().int().min(1).max(12).optional(),
  statusBarMinute: z.number().int().min(0).max(59).optional(),
  statusBarMeridiem: meridiemSchema.optional(),
  // iOS's own status bar never shows AM/PM — this is opt-in.
  statusBarShowMeridiem: z.boolean().optional(),
  statusBarBattery: z.number().int().min(0).max(100).optional(),
  // 1 or 2 SIMs, each with its own independently-set signal strength.
  statusBarSimCount: z.union([z.literal(1), z.literal(2)]).optional(),
  statusBarSim1Bars: z.number().int().min(0).max(4).optional(),
  statusBarSim2Bars: z.number().int().min(0).max(4).optional(),
  statusBarWifiEnabled: z.boolean().optional(),
  statusBarWifiBars: z.number().int().min(0).max(4).optional(),
  items: z.array(conversationItemSchema),
  // Chat List generator fields (kind === "chatList") — all optional since
  // conversation-kind projects never populate them, and vice versa.
  chatListMeUsername: z.string().optional(),
  chatListShowAccountSwitcher: z.boolean().optional(),
  chatListRequestsCount: z.number().int().min(0).optional(),
  chatListMeNote: meNoteContentSchema.optional(),
  chatListNotes: z.array(noteItemSchema).optional(),
  chatListChats: z.array(chatRowSchema).optional(),
  favorite: z.boolean(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Platform = z.infer<typeof platformSchema>;
export type ProjectKind = z.infer<typeof projectKindSchema>;
export type ConversationKind = z.infer<typeof conversationKindSchema>;
export type ConversationTheme = z.infer<typeof conversationThemeSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type RecipientStory = z.infer<typeof recipientStorySchema>;
export type ProfileCardRelationship = z.infer<typeof profileCardRelationshipSchema>;
export type Project = z.infer<typeof projectSchema>;
