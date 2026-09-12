import { create } from "zustand";
import { useProjectStore } from "@/stores/useProjectStore";
import { buildTimeFromClock } from "@/lib/format";
import type {
  CallKind,
  ConversationItem,
  DividerDay,
  Meridiem,
  MessageSender,
  PhotoItem,
} from "@/schemas/conversation-item";

const HISTORY_LIMIT = 100;

export type DividerFields = { day: DividerDay; hour: number; minute: number; meridiem: Meridiem };
export type ClockTime = { hour: number; minute: number; meridiem: Meridiem };
export type ReelFields = {
  thumbnail: PhotoItem;
  ownerUsername: string;
  ownerAvatar?: string;
  verified: boolean;
};
export type StoryFields = {
  thumbnail: PhotoItem;
  ownerUsername: string;
  ownerAvatar?: string;
  verified: boolean;
};
export type VoiceFields = {
  durationSeconds: number;
  barHeights: number[];
};
export type PostFields = {
  thumbnail: PhotoItem;
  ownerUsername: string;
  ownerAvatar?: string;
  verified: boolean;
  caption: string;
  isCarousel: boolean;
};

type EditorState = {
  projectId: string | null;
  selectedItemId: string | null;
  // Bulk-selection checkboxes (distinct from selectedItemId, which is the
  // single row currently open for editing) — lets several items be
  // deleted or flipped to the other sender in one action.
  checkedIds: string[];
  past: ConversationItem[][];
  future: ConversationItem[][];

  loadProject: (projectId: string) => void;
  select: (id: string | null) => void;
  toggleChecked: (id: string) => void;
  clearChecked: () => void;
  deleteCheckedItems: () => void;
  switchSenderForCheckedItems: () => void;

  addMessage: (sender: MessageSender, content: string) => void;
  insertCall: (
    index: number,
    sender: MessageSender,
    callKind: CallKind,
    phase: "ongoing" | "completed",
    startTime: ClockTime,
    endTime?: ClockTime,
  ) => void;
  insertPhotoMessage: (index: number, sender: MessageSender, photos: PhotoItem[]) => void;
  updatePhotoMessage: (id: string, photos: PhotoItem[]) => void;
  insertReelMessage: (index: number, sender: MessageSender, fields: ReelFields) => void;
  updateReelMessage: (id: string, fields: ReelFields) => void;
  insertStoryMessage: (index: number, sender: MessageSender, fields: StoryFields) => void;
  updateStoryMessage: (id: string, fields: StoryFields) => void;
  insertVoiceMessage: (index: number, sender: MessageSender, fields: VoiceFields) => void;
  updateVoiceMessage: (id: string, fields: VoiceFields) => void;
  insertPostMessage: (index: number, sender: MessageSender, fields: PostFields) => void;
  updatePostMessage: (id: string, fields: PostFields) => void;
  updateMessageContent: (id: string, content: string) => void;
  updateMessageSender: (id: string, sender: MessageSender) => void;
  updateMessageTimestamp: (id: string, timestamp: string) => void;
  updateCallTime: (id: string, time: ClockTime) => void;
  setMessageReaction: (id: string, reaction: string | null) => void;
  setMessageEdited: (id: string, edited: boolean) => void;

  insertDivider: (index: number, fields: DividerFields) => void;
  updateDivider: (id: string, fields: DividerFields) => void;
  insertSystemMessage: (index: number, template: string) => void;
  updateSystemMessage: (id: string, template: string) => void;

  addReply: (targetId: string, sender: MessageSender, content: string) => void;

  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  reorderItems: (activeId: string, overId: string) => void;

  undo: () => void;
  redo: () => void;
};

function currentItems(projectId: string | null): ConversationItem[] {
  if (!projectId) return [];
  const project = useProjectStore.getState().projects.find((p) => p.id === projectId);
  return project?.items ?? [];
}

function commit(
  set: (partial: Partial<EditorState>) => void,
  get: () => EditorState,
  projectId: string,
  before: ConversationItem[],
  next: ConversationItem[],
  extra?: Partial<EditorState>,
) {
  useProjectStore.getState().setConversationItems(projectId, next);
  set({
    past: [...get().past, before].slice(-HISTORY_LIMIT),
    future: [],
    ...extra,
  });
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  selectedItemId: null,
  checkedIds: [],
  past: [],
  future: [],

  loadProject: (projectId) => {
    if (get().projectId === projectId) return;
    set({ projectId, selectedItemId: null, checkedIds: [], past: [], future: [] });
  },

  select: (id) => set({ selectedItemId: id }),

  toggleChecked: (id) =>
    set((state) => ({
      checkedIds: state.checkedIds.includes(id)
        ? state.checkedIds.filter((i) => i !== id)
        : [...state.checkedIds, id],
    })),

  clearChecked: () => set({ checkedIds: [] }),

  deleteCheckedItems: () => {
    const { projectId, checkedIds, selectedItemId } = get();
    if (!projectId || checkedIds.length === 0) return;
    const before = currentItems(projectId);
    const checkedSet = new Set(checkedIds);
    // Sweep in a call's paired half too, same cascade deleteItem uses.
    const idsToRemove = new Set<string>();
    for (const item of before) {
      if (!checkedSet.has(item.id)) continue;
      idsToRemove.add(item.id);
      if (item.kind === "message" && item.pairId) idsToRemove.add(item.pairId);
    }
    const next = before
      .filter((item) => !idsToRemove.has(item.id))
      .map((item) =>
        item.kind === "message" && item.replyTo && idsToRemove.has(item.replyTo)
          ? { ...item, replyTo: undefined }
          : item,
      );
    commit(set, get, projectId, before, next, {
      selectedItemId: selectedItemId && idsToRemove.has(selectedItemId) ? null : selectedItemId,
      checkedIds: [],
    });
  },

  switchSenderForCheckedItems: () => {
    const { projectId, checkedIds } = get();
    if (!projectId || checkedIds.length === 0) return;
    const before = currentItems(projectId);
    const checkedSet = new Set(checkedIds);
    // Flip a call's paired half along with it, same as a single toggle.
    const idsToFlip = new Set<string>();
    for (const item of before) {
      if (item.kind !== "message" || !checkedSet.has(item.id)) continue;
      idsToFlip.add(item.id);
      if (item.pairId) idsToFlip.add(item.pairId);
    }
    if (idsToFlip.size === 0) return;
    const next = before.map((item) =>
      item.kind === "message" && idsToFlip.has(item.id)
        ? { ...item, sender: (item.sender === "me" ? "recipient" : "me") as MessageSender }
        : item,
    );
    commit(set, get, projectId, before, next, { checkedIds: [] });
  },

  addMessage: (sender, content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const message: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "text",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    commit(set, get, projectId, before, [...before, message], {
      selectedItemId: message.id,
    });
  },

  insertCall: (index, sender, callKind, phase, startTime, endTime) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);

    const startedId = crypto.randomUUID();
    const startedTimestamp = buildTimeFromClock(startTime.hour, startTime.minute, startTime.meridiem);

    if (phase === "ongoing" || !endTime) {
      const started: ConversationItem = {
        kind: "message",
        id: startedId,
        sender,
        type: "call",
        content: "",
        timestamp: startedTimestamp,
        callKind,
        callPhase: "started",
      };
      const next = [...before.slice(0, index), started, ...before.slice(index)];
      commit(set, get, projectId, before, next, { selectedItemId: started.id });
      return;
    }

    let endedTimestamp = buildTimeFromClock(endTime.hour, endTime.minute, endTime.meridiem);
    if (new Date(endedTimestamp).getTime() < new Date(startedTimestamp).getTime()) {
      endedTimestamp = new Date(new Date(endedTimestamp).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
    const endedId = crypto.randomUUID();
    const started: ConversationItem = {
      kind: "message",
      id: startedId,
      sender,
      type: "call",
      content: "",
      timestamp: startedTimestamp,
      callKind,
      callPhase: "started",
      pairId: endedId,
    };
    const ended: ConversationItem = {
      kind: "message",
      id: endedId,
      sender,
      type: "call",
      content: "",
      timestamp: endedTimestamp,
      callKind,
      callPhase: "ended",
      pairId: startedId,
    };
    const next = [...before.slice(0, index), started, ended, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: ended.id });
  },

  insertPhotoMessage: (index, sender, photos) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const photo: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "photo",
      content: "",
      timestamp: new Date().toISOString(),
      photos,
    };
    const next = [...before.slice(0, index), photo, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: photo.id });
  },

  updatePhotoMessage: (id, photos) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message" || original.type !== "photo") return;
    const next = before.map((item) => (item.id === id ? { ...item, photos } : item));
    commit(set, get, projectId, before, next);
  },

  insertReelMessage: (index, sender, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const reel: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "reel",
      content: "",
      timestamp: new Date().toISOString(),
      reelThumbnail: fields.thumbnail,
      reelOwnerUsername: fields.ownerUsername,
      reelOwnerAvatar: fields.ownerAvatar,
      reelVerified: fields.verified,
    };
    const next = [...before.slice(0, index), reel, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: reel.id });
  },

  updateReelMessage: (id, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message" || original.type !== "reel") return;
    const next = before.map((item) =>
      item.id === id
        ? {
            ...item,
            reelThumbnail: fields.thumbnail,
            reelOwnerUsername: fields.ownerUsername,
            reelOwnerAvatar: fields.ownerAvatar,
            reelVerified: fields.verified,
          }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  insertStoryMessage: (index, sender, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const story: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "story",
      content: "",
      timestamp: new Date().toISOString(),
      storyThumbnail: fields.thumbnail,
      storyOwnerUsername: fields.ownerUsername,
      storyOwnerAvatar: fields.ownerAvatar,
      storyVerified: fields.verified,
    };
    const next = [...before.slice(0, index), story, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: story.id });
  },

  updateStoryMessage: (id, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message" || original.type !== "story") return;
    const next = before.map((item) =>
      item.id === id
        ? {
            ...item,
            storyThumbnail: fields.thumbnail,
            storyOwnerUsername: fields.ownerUsername,
            storyOwnerAvatar: fields.ownerAvatar,
            storyVerified: fields.verified,
          }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  insertVoiceMessage: (index, sender, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const voice: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "voice",
      content: "",
      timestamp: new Date().toISOString(),
      voiceDurationSeconds: fields.durationSeconds,
      voiceBarHeights: fields.barHeights,
    };
    const next = [...before.slice(0, index), voice, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: voice.id });
  },

  updateVoiceMessage: (id, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message" || original.type !== "voice") return;
    const next = before.map((item) =>
      item.id === id
        ? { ...item, voiceDurationSeconds: fields.durationSeconds, voiceBarHeights: fields.barHeights }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  insertPostMessage: (index, sender, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const post: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "post",
      content: "",
      timestamp: new Date().toISOString(),
      postThumbnail: fields.thumbnail,
      postOwnerUsername: fields.ownerUsername,
      postOwnerAvatar: fields.ownerAvatar,
      postVerified: fields.verified,
      postCaption: fields.caption,
      postIsCarousel: fields.isCarousel,
    };
    const next = [...before.slice(0, index), post, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: post.id });
  },

  updatePostMessage: (id, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message" || original.type !== "post") return;
    const next = before.map((item) =>
      item.id === id
        ? {
            ...item,
            postThumbnail: fields.thumbnail,
            postOwnerUsername: fields.ownerUsername,
            postOwnerAvatar: fields.ownerAvatar,
            postVerified: fields.verified,
            postCaption: fields.caption,
            postIsCarousel: fields.isCarousel,
          }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  updateMessageContent: (id, content) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message") return;
    const trimmed = content.trim();
    const finalContent = trimmed || original.content;
    if (finalContent === original.content) return;
    const next = before.map((item) =>
      item.id === id && item.kind === "message" ? { ...item, content: finalContent } : item,
    );
    commit(set, get, projectId, before, next);
  },

  updateMessageSender: (id, sender) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message") return;
    // A call's started/ended items are one logical unit (linked via
    // pairId) — switching the sender on either half switches both.
    const pairId = original.pairId;
    const next = before.map((item) =>
      item.kind === "message" && (item.id === id || (pairId && item.id === pairId))
        ? { ...item, sender }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  updateMessageTimestamp: (id, timestamp) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message") return;
    const next = before.map((item) =>
      item.id === id && item.kind === "message" ? { ...item, timestamp } : item,
    );
    commit(set, get, projectId, before, next);
  },

  updateCallTime: (id, time) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message" || original.type !== "call") return;
    const timestamp = buildTimeFromClock(
      time.hour,
      time.minute,
      time.meridiem,
      new Date(original.timestamp),
    );
    const next = before.map((item) => (item.id === id ? { ...item, timestamp } : item));
    commit(set, get, projectId, before, next);
  },

  setMessageReaction: (id, reaction) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message") return;
    const next = before.map((item) =>
      item.id === id && item.kind === "message"
        ? { ...item, reaction: reaction ?? undefined }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  setMessageEdited: (id, edited) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "message") return;
    const next = before.map((item) =>
      item.id === id && item.kind === "message"
        ? { ...item, edited: edited || undefined }
        : item,
    );
    commit(set, get, projectId, before, next);
  },

  insertDivider: (index, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const divider: ConversationItem = { kind: "divider", id: crypto.randomUUID(), ...fields };
    const next = [...before.slice(0, index), divider, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: divider.id });
  },

  updateDivider: (id, fields) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "divider") return;
    const next = before.map((item) =>
      item.id === id && item.kind === "divider" ? { ...item, ...fields } : item,
    );
    commit(set, get, projectId, before, next);
  },

  insertSystemMessage: (index, template) => {
    const trimmed = template.trim();
    if (!trimmed) return;
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const system: ConversationItem = { kind: "system", id: crypto.randomUUID(), template: trimmed };
    const next = [...before.slice(0, index), system, ...before.slice(index)];
    commit(set, get, projectId, before, next, { selectedItemId: system.id });
  },

  updateSystemMessage: (id, template) => {
    const trimmed = template.trim();
    if (!trimmed) return;
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const original = before.find((item) => item.id === id);
    if (!original || original.kind !== "system") return;
    const next = before.map((item) =>
      item.id === id && item.kind === "system" ? { ...item, template: trimmed } : item,
    );
    commit(set, get, projectId, before, next);
  },

  addReply: (targetId, sender, content) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const index = before.findIndex((item) => item.id === targetId);
    if (index === -1) return;
    const reply: ConversationItem = {
      kind: "message",
      id: crypto.randomUUID(),
      sender,
      type: "text",
      content,
      timestamp: new Date().toISOString(),
      replyTo: targetId,
    };
    const next = [...before.slice(0, index + 1), reply, ...before.slice(index + 1)];
    commit(set, get, projectId, before, next, { selectedItemId: reply.id });
  },

  deleteItem: (id) => {
    const { projectId, selectedItemId, checkedIds } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const target = before.find((item) => item.id === id);
    const pairId = target?.kind === "message" ? target.pairId : undefined;
    const idsToRemove = new Set(pairId ? [id, pairId] : [id]);
    // A deleted message may be quoted by other messages' replyTo — drop
    // those dangling references rather than leaving them pointing at
    // nothing (same cascade concern pairId already handles for calls).
    const next = before
      .filter((item) => !idsToRemove.has(item.id))
      .map((item) =>
        item.kind === "message" && item.replyTo && idsToRemove.has(item.replyTo)
          ? { ...item, replyTo: undefined }
          : item,
      );
    commit(set, get, projectId, before, next, {
      selectedItemId: selectedItemId && idsToRemove.has(selectedItemId) ? null : selectedItemId,
      checkedIds: checkedIds.filter((checkedId) => !idsToRemove.has(checkedId)),
    });
  },

  duplicateItem: (id) => {
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const index = before.findIndex((item) => item.id === id);
    if (index === -1) return;
    const original = before[index];
    const pairId = original.kind === "message" ? original.pairId : undefined;
    const partnerIndex = pairId ? before.findIndex((item) => item.id === pairId) : -1;

    // A call's started/ended items are one logical unit — duplicate both
    // together, re-linked to each other, rather than splitting the pair.
    const partner = partnerIndex !== -1 ? before[partnerIndex] : undefined;
    if (partner && partner.kind === "message" && original.kind === "message") {
      const [firstIndex, secondIndex] = [index, partnerIndex].sort((a, b) => a - b);
      const first = before[firstIndex] as typeof original;
      const second = before[secondIndex] as typeof original;
      const newFirstId = crypto.randomUUID();
      const newSecondId = crypto.randomUUID();
      const firstCopy: ConversationItem = { ...first, id: newFirstId, pairId: newSecondId };
      const secondCopy: ConversationItem = { ...second, id: newSecondId, pairId: newFirstId };
      const next = [
        ...before.slice(0, secondIndex + 1),
        firstCopy,
        secondCopy,
        ...before.slice(secondIndex + 1),
      ];
      commit(set, get, projectId, before, next, { selectedItemId: firstCopy.id });
      return;
    }

    const copy: ConversationItem =
      original.kind === "message"
        ? { ...original, id: crypto.randomUUID(), pairId: undefined }
        : { ...original, id: crypto.randomUUID() };
    const next = [...before.slice(0, index + 1), copy, ...before.slice(index + 1)];
    commit(set, get, projectId, before, next, { selectedItemId: copy.id });
  },

  reorderItems: (activeId, overId) => {
    if (activeId === overId) return;
    const { projectId } = get();
    if (!projectId) return;
    const before = currentItems(projectId);
    const active = before.find((item) => item.id === activeId);
    const pairId = active?.kind === "message" ? active.pairId : undefined;

    // A call's started/ended items move together as one contiguous block.
    if (pairId) {
      const blockIds = new Set([activeId, pairId]);
      const block = before
        .filter((item) => blockIds.has(item.id))
        .sort((a, b) => before.indexOf(a) - before.indexOf(b));
      const rest = before.filter((item) => !blockIds.has(item.id));
      const overIndexInRest = rest.findIndex((item) => item.id === overId);
      if (overIndexInRest === -1) return;
      const next = [...rest.slice(0, overIndexInRest), ...block, ...rest.slice(overIndexInRest)];
      commit(set, get, projectId, before, next);
      return;
    }

    const fromIndex = before.findIndex((item) => item.id === activeId);
    const toIndex = before.findIndex((item) => item.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...before];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    commit(set, get, projectId, before, next);
  },

  undo: () => {
    const { projectId, past, future } = get();
    if (!projectId || past.length === 0) return;
    const previous = past[past.length - 1];
    const present = currentItems(projectId);
    useProjectStore.getState().setConversationItems(projectId, previous);
    set({
      past: past.slice(0, -1),
      future: [present, ...future].slice(0, HISTORY_LIMIT),
    });
  },

  redo: () => {
    const { projectId, past, future } = get();
    if (!projectId || future.length === 0) return;
    const [next, ...rest] = future;
    const present = currentItems(projectId);
    useProjectStore.getState().setConversationItems(projectId, next);
    set({
      past: [...past, present].slice(-HISTORY_LIMIT),
      future: rest,
    });
  },
}));
