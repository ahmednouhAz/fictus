import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ConversationKind,
  ConversationTheme,
  Device,
  Platform,
  Project,
  ProjectKind,
  ProfileCardRelationship,
  RecipientStory,
} from "@/schemas/project";
import type { ConversationItem, Meridiem } from "@/schemas/conversation-item";
import type { SavedRecipient, SavedRecipientFields } from "@/schemas/recipient";
import type { ChatRowData, MeNoteContent, NoteItemData } from "@/schemas/chat-list";
import type { FollowRequestRow } from "@/schemas/follow-request";
import { useRecipientStore } from "@/stores/useRecipientStore";

const DEFAULT_CHAT_LIST_NOTE_COUNT = 4;
const DEFAULT_CHAT_LIST_CHAT_COUNT = 10;
const DEFAULT_FOLLOW_REQUEST_COUNT = 8;

function createBlankChatListNote(): NoteItemData {
  return { id: crypto.randomUUID(), username: "", type: "text", content: "" };
}

function createBlankChatListChat(index: number): ChatRowData {
  return {
    id: crypto.randomUUID(),
    username: `user${index + 1}`,
    previewText: "4+ new messages",
    time: "3h",
    seen: false,
  };
}

// Placeholder mutual-follower avatars for freshly created rows — replaced
// by whatever the user uploads, same as every other placeholder default in
// this app (blank chat rows, blank notes, ...).
const DEFAULT_MUTUAL_AVATARS = [
  "/profile%20pictures/1.png",
  "/profile%20pictures/2.png",
  "/profile%20pictures/3.png",
];

// Fixed, deliberately mixed variant per default row (0 = plain @username,
// 1-3 = "mutuals" with that many avatars) — guarantees the default 8-row
// list always shows every variant (3/2/1 mutuals plus plain-text rows)
// rather than leaving it to chance, which could easily roll all-one-kind.
const DEFAULT_ROW_VARIANTS: Array<0 | 1 | 2 | 3> = [3, 0, 2, 0, 1, 3, 0, 2];

// New follow-request lists start pre-filled with a believable mix instead
// of 8 identical blank rows, cycling through DEFAULT_ROW_VARIANTS above.
function createBlankFollowRequestRow(index: number): FollowRequestRow {
  const variant = DEFAULT_ROW_VARIANTS[index % DEFAULT_ROW_VARIANTS.length];
  if (variant === 0) {
    return { id: crypto.randomUUID(), displayName: `User ${index + 1}` };
  }
  return {
    id: crypto.randomUUID(),
    displayName: `User ${index + 1}`,
    subtitleMode: "mutuals",
    mutualAvatars: DEFAULT_MUTUAL_AVATARS.slice(0, variant),
    mutualsText: variant === 1 ? "1 mutual" : `${variant} mutuals`,
  };
}

// Upgrades a follow-request row from its pre-redesign shape (`username` as
// the bold display name, a freeform `subtitle`) to the current one
// (`displayName` always bold; `username`/`subtitleMode`/`mutualsText`/
// `mutualAvatars` drive the second line). Rows that already have
// `displayName` are already current and pass through unchanged.
function upgradeFollowRequestRow(row: unknown) {
  const record = row as Record<string, unknown>;
  if (typeof record.displayName === "string") return row;
  return {
    id: record.id,
    displayName: typeof record.username === "string" ? record.username : "User",
    avatar: record.avatar,
    verified: record.verified,
    recipientId: record.recipientId,
  };
}

// Upgrades a pre-Phase-A-fix divider item (`time: string`, e.g. "5:20 PM")
// to the current structured `hour`/`minute`/`meridiem` shape. Every other
// item kind passes through unchanged.
function upgradeDividerFields(item: unknown) {
  const record = item as Record<string, unknown>;
  if (record.kind !== "divider" || typeof record.hour === "number") return item;
  const match = typeof record.time === "string" ? record.time.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])/) : null;
  const rest = { ...record };
  delete rest.time;
  return {
    ...rest,
    hour: match ? Number(match[1]) : 12,
    minute: match ? Number(match[2]) : 0,
    meridiem: match ? (match[3].toUpperCase() as "AM" | "PM") : "PM",
  };
}

type ProjectState = {
  projects: Project[];
  hasHydrated: boolean;
  createProject: (
    platform: Platform,
    name?: string,
    conversationKind?: ConversationKind,
    kind?: ProjectKind,
  ) => Project;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => Project | null;
  toggleFavorite: (id: string) => void;
  deleteProject: (id: string) => void;
  setRecipientName: (id: string, name: string) => void;
  setRecipientNameHidden: (id: string, hidden: boolean) => void;
  setRecipientUsername: (id: string, username: string) => void;
  setRecipientAvatar: (id: string, avatar: string | null) => void;
  setRecipientVerified: (id: string, verified: boolean) => void;
  setRecipientStory: (id: string, story: RecipientStory) => void;
  setProfileCard: (
    id: string,
    fields: Partial<{
      enabled: boolean;
      followers: string;
      posts: number;
      relationship: ProfileCardRelationship;
      followedSinceYear: number;
      note: string;
      showViewProfileButton: boolean;
    }>,
  ) => void;
  setDevice: (id: string, device: Device) => void;
  setTheme: (id: string, theme: ConversationTheme) => void;
  setStatusBar: (
    id: string,
    fields: Partial<{
      visible: boolean;
      hour: number;
      minute: number;
      meridiem: Meridiem;
      showMeridiem: boolean;
      battery: number;
      simCount: 1 | 2;
      sim1Bars: number;
      sim2Bars: number;
      wifiEnabled: boolean;
      wifiBars: number;
    }>,
  ) => void;
  setConversationItems: (id: string, items: ConversationItem[]) => void;
  // Chat List generator setters (kind === "chatList") — mirror the
  // conversation setters above but write onto the chatList* fields.
  setChatListMeUsername: (id: string, username: string) => void;
  setChatListShowAccountSwitcher: (id: string, show: boolean) => void;
  setChatListRequestsCount: (id: string, count: number) => void;
  setChatListMeNote: (id: string, note: MeNoteContent) => void;
  setChatListNotes: (id: string, notes: NoteItemData[]) => void;
  setChatListChats: (id: string, chats: ChatRowData[]) => void;
  // Notification Overlay generator setters (kind === "notification").
  setNotificationBackground: (
    id: string,
    image: { dataUrl: string; width: number; height: number } | null,
  ) => void;
  setNotificationAvatar: (id: string, avatar: string | null) => void;
  setNotificationContent: (
    id: string,
    fields: Partial<{ title: string; body: string }>,
  ) => void;
  // Follow Requests generator setter (kind === "followRequests").
  setFollowRequestRows: (id: string, rows: FollowRequestRow[]) => void;
  // Copies a saved recipient's fields onto this project and links it —
  // further edits to the recipient fields below flow back to that saved
  // record automatically (see the `syncRecipient` calls in each setter).
  applySavedRecipient: (id: string, recipient: SavedRecipient) => void;
  // Persists this project's current recipient fields as a saved recipient
  // — creates a new one, or updates the linked one if already linked —
  // and links the project to whatever record results.
  saveRecipientFromProject: (id: string) => SavedRecipient | null;
  // Unlinks from any saved recipient and resets the identity fields back
  // to fresh placeholders — a clean slate for building a new profile,
  // without touching per-conversation settings (theme, device, items...).
  resetRecipient: (id: string) => void;
};

// Pushes a field update to the saved recipient this project is linked to,
// if any — a no-op for projects with no linked recipient (recipientId is
// null for every project until the user explicitly links or saves one).
function syncRecipient(recipientId: string | null | undefined, fields: Partial<SavedRecipientFields>) {
  if (!recipientId) return;
  useRecipientStore.getState().updateRecipient(recipientId, fields);
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      hasHydrated: false,

      createProject: (platform, name, conversationKind, kind) => {
        const now = new Date().toISOString();

        if (kind === "chatList") {
          const project: Project = {
            id: crypto.randomUUID(),
            name: name?.trim() || "Untitled chat list",
            platform,
            kind: "chatList",
            theme: "dark",
            recipientId: null,
            recipientName: "",
            device: "ios",
            statusBarVisible: true,
            statusBarHour: 9,
            statusBarMinute: 41,
            statusBarMeridiem: "AM",
            statusBarShowMeridiem: false,
            statusBarBattery: 100,
            statusBarSimCount: 1,
            statusBarSim1Bars: 4,
            statusBarSim2Bars: 4,
            statusBarWifiEnabled: true,
            statusBarWifiBars: 3,
            items: [],
            chatListMeUsername: "your_username",
            chatListShowAccountSwitcher: true,
            chatListRequestsCount: 0,
            chatListMeNote: { type: "text", content: "Make this space yours..." },
            // Starts pre-filled with 4 blank notes / 10 blank chat rows
            // (matching the real app's default tray), which the user can
            // fill in or delete — not an empty list built up from scratch.
            chatListNotes: Array.from(
              { length: DEFAULT_CHAT_LIST_NOTE_COUNT },
              createBlankChatListNote,
            ),
            chatListChats: Array.from(
              { length: DEFAULT_CHAT_LIST_CHAT_COUNT },
              (_, i) => createBlankChatListChat(i),
            ),
            favorite: false,
            archivedAt: null,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ projects: [project, ...state.projects] }));
          return project;
        }

        if (kind === "notification") {
          const project: Project = {
            id: crypto.randomUUID(),
            name: name?.trim() || "Untitled notification",
            platform,
            kind: "notification",
            theme: "dark",
            recipientId: null,
            recipientName: "",
            items: [],
            notificationTitle: "username",
            notificationBody: "sent you a message",
            favorite: false,
            archivedAt: null,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ projects: [project, ...state.projects] }));
          return project;
        }

        if (kind === "followRequests") {
          const project: Project = {
            id: crypto.randomUUID(),
            name: name?.trim() || "Untitled follow requests",
            platform,
            kind: "followRequests",
            theme: "dark",
            recipientId: null,
            recipientName: "",
            device: "ios",
            statusBarVisible: true,
            statusBarHour: 9,
            statusBarMinute: 41,
            statusBarMeridiem: "AM",
            statusBarShowMeridiem: false,
            statusBarBattery: 100,
            statusBarSimCount: 1,
            statusBarSim1Bars: 4,
            statusBarSim2Bars: 4,
            statusBarWifiEnabled: true,
            statusBarWifiBars: 3,
            items: [],
            // Starts pre-filled with 5 blank rows (same idea as the chat
            // list's default tray) rather than an empty list.
            followRequestRows: Array.from(
              { length: DEFAULT_FOLLOW_REQUEST_COUNT },
              (_, i) => createBlankFollowRequestRow(i),
            ),
            favorite: false,
            archivedAt: null,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ projects: [project, ...state.projects] }));
          return project;
        }

        const isMessageRequest = conversationKind === "messageRequest";
        // Every new conversation opens with a timestamp and a single
        // message rather than a blank slate — both are ordinary items the
        // user can edit or delete like anything else, just enough so it
        // doesn't start completely empty.
        const seedItems: ConversationItem[] = [
          {
            kind: "divider",
            id: crypto.randomUUID(),
            day: "none",
            hour: 12,
            minute: 0,
            meridiem: "PM",
          },
          {
            kind: "message",
            id: crypto.randomUUID(),
            sender: "recipient",
            type: "text",
            content: "Hey!",
            timestamp: now,
          },
        ];
        const project: Project = {
          id: crypto.randomUUID(),
          name: name?.trim() || "Untitled conversation",
          platform,
          kind: "conversation",
          conversationKind,
          theme: "dark",
          recipientId: null,
          recipientName: "Recipient",
          recipientUsername: "recipient",
          // A message request always leads with the profile card (with
          // the view-profile button) since there's no shared history yet.
          profileCardEnabled: isMessageRequest ? true : undefined,
          profileCardShowViewProfileButton: isMessageRequest ? true : undefined,
          // Sensible starting content for whenever the profile card gets
          // turned on — "follow each other" is the most common real case,
          // and a filled-in note reads better than a blank field.
          profileCardRelationship: "mutual",
          profileCardNote: "You both follow fictus and 2 others",
          device: "ios",
          statusBarVisible: true,
          statusBarHour: 9,
          statusBarMinute: 41,
          statusBarMeridiem: "AM",
          statusBarShowMeridiem: false,
          statusBarBattery: 100,
          statusBarSimCount: 1,
          statusBarSim1Bars: 4,
          statusBarSim2Bars: 4,
          statusBarWifiEnabled: true,
          statusBarWifiBars: 3,
          items: seedItems,
          favorite: false,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return project;
      },

      renameProject: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, name: trimmed, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
      },

      duplicateProject: (id) => {
        const source = get().projects.find((p) => p.id === id);
        if (!source) return null;
        const now = new Date().toISOString();
        const copy: Project = {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name} copy`,
          items: source.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
          chatListNotes: source.chatListNotes?.map((note) => ({
            ...note,
            id: crypto.randomUUID(),
          })),
          chatListChats: source.chatListChats?.map((chat) => ({
            ...chat,
            id: crypto.randomUUID(),
          })),
          followRequestRows: source.followRequestRows?.map((row) => ({
            ...row,
            id: crypto.randomUUID(),
          })),
          favorite: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [copy, ...state.projects] }));
        return copy;
      },

      toggleFavorite: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, favorite: !p.favorite, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      setRecipientName: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, recipientName: trimmed, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
        syncRecipient(get().projects.find((p) => p.id === id)?.recipientId, { name: trimmed });
      },

      setRecipientNameHidden: (id, hidden) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, recipientNameHidden: hidden, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
        syncRecipient(get().projects.find((p) => p.id === id)?.recipientId, { nameHidden: hidden });
      },

      setRecipientUsername: (id, username) => {
        const trimmed = username.trim() || undefined;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, recipientUsername: trimmed, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
        syncRecipient(get().projects.find((p) => p.id === id)?.recipientId, { username: trimmed });
      },

      setRecipientAvatar: (id, avatar) => {
        const next = avatar ?? undefined;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, recipientAvatar: next, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
        syncRecipient(get().projects.find((p) => p.id === id)?.recipientId, { avatar: next });
      },

      setRecipientVerified: (id, verified) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, recipientVerified: verified, updatedAt: new Date().toISOString() } : p,
          ),
        }));
        syncRecipient(get().projects.find((p) => p.id === id)?.recipientId, { verified });
      },

      setRecipientStory: (id, story) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, recipientStory: story, updatedAt: new Date().toISOString() } : p,
          ),
        }));
        syncRecipient(get().projects.find((p) => p.id === id)?.recipientId, { story });
      },

      setProfileCard: (id, fields) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  profileCardEnabled: fields.enabled ?? p.profileCardEnabled,
                  profileCardFollowers: fields.followers ?? p.profileCardFollowers,
                  profileCardPosts: fields.posts ?? p.profileCardPosts,
                  profileCardRelationship: fields.relationship ?? p.profileCardRelationship,
                  profileCardFollowedSinceYear:
                    fields.followedSinceYear ?? p.profileCardFollowedSinceYear,
                  profileCardNote: fields.note ?? p.profileCardNote,
                  profileCardShowViewProfileButton:
                    fields.showViewProfileButton ?? p.profileCardShowViewProfileButton,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        }));
        // profileCardEnabled/showViewProfileButton are per-conversation
        // display toggles, not part of the recipient's identity, so they
        // don't sync to the saved recipient — only the profile-card
        // content fields do.
        const recipientId = get().projects.find((p) => p.id === id)?.recipientId;
        syncRecipient(recipientId, {
          ...(fields.followers !== undefined && { profileCardFollowers: fields.followers }),
          ...(fields.posts !== undefined && { profileCardPosts: fields.posts }),
          ...(fields.relationship !== undefined && { profileCardRelationship: fields.relationship }),
          ...(fields.followedSinceYear !== undefined && {
            profileCardFollowedSinceYear: fields.followedSinceYear,
          }),
          ...(fields.note !== undefined && { profileCardNote: fields.note }),
        });
      },

      setDevice: (id, device) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, device, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      setStatusBar: (id, fields) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  statusBarVisible: fields.visible ?? p.statusBarVisible,
                  statusBarHour: fields.hour ?? p.statusBarHour,
                  statusBarMinute: fields.minute ?? p.statusBarMinute,
                  statusBarMeridiem: fields.meridiem ?? p.statusBarMeridiem,
                  statusBarShowMeridiem: fields.showMeridiem ?? p.statusBarShowMeridiem,
                  statusBarBattery: fields.battery ?? p.statusBarBattery,
                  statusBarSimCount: fields.simCount ?? p.statusBarSimCount,
                  statusBarSim1Bars: fields.sim1Bars ?? p.statusBarSim1Bars,
                  statusBarSim2Bars: fields.sim2Bars ?? p.statusBarSim2Bars,
                  statusBarWifiEnabled: fields.wifiEnabled ?? p.statusBarWifiEnabled,
                  statusBarWifiBars: fields.wifiBars ?? p.statusBarWifiBars,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      setTheme: (id, theme) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, theme, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      setConversationItems: (id, items) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, items, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      setChatListMeUsername: (id, username) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, chatListMeUsername: username, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      setChatListShowAccountSwitcher: (id, show) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  chatListShowAccountSwitcher: show,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      setChatListRequestsCount: (id, count) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, chatListRequestsCount: count, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      setChatListMeNote: (id, note) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, chatListMeNote: note, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      setChatListNotes: (id, notes) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, chatListNotes: notes, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      setChatListChats: (id, chats) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, chatListChats: chats, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      setNotificationBackground: (id, image) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  notificationBackgroundImage: image?.dataUrl,
                  notificationBackgroundWidth: image?.width,
                  notificationBackgroundHeight: image?.height,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      setNotificationAvatar: (id, avatar) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  notificationAvatar: avatar ?? undefined,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      setNotificationContent: (id, fields) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  notificationTitle: fields.title ?? p.notificationTitle,
                  notificationBody: fields.body ?? p.notificationBody,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      setFollowRequestRows: (id, rows) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, followRequestRows: rows, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      applySavedRecipient: (id, recipient) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  recipientId: recipient.id,
                  recipientName: recipient.name,
                  recipientNameHidden: recipient.nameHidden,
                  recipientUsername: recipient.username,
                  recipientAvatar: recipient.avatar,
                  recipientVerified: recipient.verified,
                  recipientStory: recipient.story,
                  profileCardFollowers: recipient.profileCardFollowers,
                  profileCardPosts: recipient.profileCardPosts,
                  profileCardRelationship: recipient.profileCardRelationship,
                  profileCardFollowedSinceYear: recipient.profileCardFollowedSinceYear,
                  profileCardNote: recipient.profileCardNote,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      saveRecipientFromProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return null;
        const saved = useRecipientStore.getState().upsertRecipient(project.recipientId, {
          name: project.recipientName,
          nameHidden: project.recipientNameHidden,
          username: project.recipientUsername,
          avatar: project.recipientAvatar,
          verified: project.recipientVerified,
          story: project.recipientStory,
          profileCardFollowers: project.profileCardFollowers,
          profileCardPosts: project.profileCardPosts,
          profileCardRelationship: project.profileCardRelationship,
          profileCardFollowedSinceYear: project.profileCardFollowedSinceYear,
          profileCardNote: project.profileCardNote,
        });
        if (project.recipientId !== saved.id) {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, recipientId: saved.id, updatedAt: new Date().toISOString() } : p,
            ),
          }));
        }
        return saved;
      },

      resetRecipient: (id) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  recipientId: null,
                  recipientName: "Recipient",
                  recipientNameHidden: undefined,
                  recipientUsername: "recipient",
                  recipientAvatar: undefined,
                  recipientVerified: undefined,
                  recipientStory: undefined,
                  profileCardFollowers: undefined,
                  profileCardPosts: undefined,
                  profileCardRelationship: undefined,
                  profileCardFollowedSinceYear: undefined,
                  profileCardNote: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),
    }),
    {
      name: "sus-projects",
      // Rehydrated manually by <StoreHydration> after mount so the first
      // client render matches the server render (empty) and avoids a
      // hydration mismatch. This whole store is a local stand-in until
      // Milestone 7 replaces it with Postgres/Prisma persistence.
      skipHydration: true,
      partialize: (state) => ({ projects: state.projects }),
      version: 4,
      // Handles pre-M3 data (no recipientName/messages), M3 data
      // (messages: Message[]), pre-Phase-A-fix divider items (time:
      // string), and pre-redesign follow-request rows (see
      // upgradeFollowRequestRow) by upgrading everything to the current
      // shapes.
      migrate: (persisted) => {
        const state = persisted as {
          projects?: (Partial<Project> & { messages?: unknown[] })[];
        };
        return {
          projects: (state.projects ?? []).map((p) => {
            const { messages, followRequestRows, ...rest } = p;
            const items =
              rest.items ??
              (Array.isArray(messages)
                ? messages.map((m) => ({ kind: "message" as const, ...(m as object) }))
                : []);
            return {
              recipientName: "Recipient",
              ...rest,
              items: items.map(upgradeDividerFields),
              followRequestRows: followRequestRows?.map(upgradeFollowRequestRow) as
                | FollowRequestRow[]
                | undefined,
            };
          }),
        } as { projects: Project[] };
      },
    },
  ),
);
