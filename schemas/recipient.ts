import { z } from "zod";
import { recipientStorySchema, profileCardRelationshipSchema } from "@/schemas/project";

// A reusable, project-independent recipient profile — set one up once
// (photo, username, followers, etc.) and reuse it across conversations.
// A project links to one via `recipientId`; edits made while linked flow
// back here so every project using that recipient stays in sync.
export const savedRecipientSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameHidden: z.boolean().optional(),
  username: z.string().optional(),
  avatar: z.string().optional(),
  verified: z.boolean().optional(),
  story: recipientStorySchema.optional(),
  profileCardFollowers: z.string().optional(),
  profileCardPosts: z.number().int().min(0).optional(),
  profileCardRelationship: profileCardRelationshipSchema.optional(),
  profileCardFollowedSinceYear: z.number().int().optional(),
  profileCardNote: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SavedRecipient = z.infer<typeof savedRecipientSchema>;

export type SavedRecipientFields = Omit<SavedRecipient, "id" | "createdAt" | "updatedAt">;
