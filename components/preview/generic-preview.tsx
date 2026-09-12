import type { ConversationItem } from "@/schemas/conversation-item";
import { formatCallTime, formatCallTitle, formatDividerLabel } from "@/lib/format";
import { parseSystemTemplate } from "@/lib/system-template";
import { CallIcon } from "@/components/preview/call-icon";
import { PhotoStack } from "@/components/preview/photo-stack";
import { ReelCard } from "@/components/preview/reel-card";
import { StoryCard } from "@/components/preview/story-card";
import { VoiceNoteBubble } from "@/components/preview/voice-note-bubble";
import { PostCard } from "@/components/preview/post-card";
import { useEditorStore } from "@/stores/useEditorStore";
import { cn } from "@/lib/utils";

export function GenericPreview({
  recipientName,
  items,
}: {
  recipientName: string;
  items: ConversationItem[];
}) {
  const select = useEditorStore((s) => s.select);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <p className="text-[13px] font-medium text-foreground">{recipientName}</p>
        <p className="text-[11px] text-foreground-subtle">
          Generic preview — the Instagram renderer is used for Instagram projects
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[13px] text-foreground-subtle">Nothing to preview yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              if (item.kind === "divider") {
                return (
                  <div key={item.id} data-item-id={item.id} className="flex justify-center py-1">
                    <span className="text-[11px] text-foreground-subtle">
                      {formatDividerLabel(item.day, item.hour, item.minute, item.meridiem)}
                    </span>
                  </div>
                );
              }
              if (item.kind === "system") {
                return (
                  <div key={item.id} data-item-id={item.id} className="flex justify-center py-1 text-center">
                    <span className="text-[12px] italic text-foreground-subtle">
                      {parseSystemTemplate(item.template, recipientName).map((seg, i) =>
                        seg.bold ? (
                          <strong key={i} className="font-semibold not-italic">
                            {seg.text}
                          </strong>
                        ) : (
                          <span key={i}>{seg.text}</span>
                        ),
                      )}
                    </span>
                  </div>
                );
              }
              if (item.type === "photo") {
                const photos = item.photos ?? [];
                const showCaption = photos.length > 3;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex flex-col gap-1",
                      item.sender === "me" ? "items-end" : "items-start",
                    )}
                  >
                    {showCaption && (
                      <span className="text-[11px] text-foreground-subtle">
                        {item.sender === "me" ? "You" : recipientName} sent {photos.length} photos
                      </span>
                    )}
                    <div
                      data-item-id={item.id}
                      onClick={() => select(item.id)}
                      className="relative cursor-pointer"
                    >
                      <PhotoStack photos={photos} size="lg" />
                      {item.reaction && (
                        <span className="absolute -bottom-2.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-bg-elevated px-1 text-[11px] leading-none">
                          {item.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.type === "reel") {
                return (
                  <div
                    key={item.id}
                    data-item-id={item.id}
                    className={cn("flex", item.sender === "me" ? "justify-end" : "justify-start")}
                  >
                    <div className="relative">
                      <div onClick={() => select(item.id)} className="cursor-pointer">
                        <ReelCard
                          thumbnail={item.reelThumbnail}
                          ownerUsername={item.reelOwnerUsername}
                          ownerAvatar={item.reelOwnerAvatar}
                          verified={item.reelVerified}
                          size="lg"
                        />
                      </div>
                      {item.reaction && (
                        <span className="absolute -bottom-2.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-bg-elevated px-1 text-[11px] leading-none">
                          {item.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.type === "story") {
                return (
                  <div
                    key={item.id}
                    data-item-id={item.id}
                    className={cn("flex", item.sender === "me" ? "justify-end" : "justify-start")}
                  >
                    <div className="relative">
                      <div onClick={() => select(item.id)} className="cursor-pointer">
                        <StoryCard
                          thumbnail={item.storyThumbnail}
                          ownerUsername={item.storyOwnerUsername}
                          ownerAvatar={item.storyOwnerAvatar}
                          verified={item.storyVerified}
                          size="lg"
                        />
                      </div>
                      {item.reaction && (
                        <span className="absolute -bottom-2.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-bg-elevated px-1 text-[11px] leading-none">
                          {item.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.type === "voice") {
                return (
                  <div
                    key={item.id}
                    data-item-id={item.id}
                    className={cn("flex", item.sender === "me" ? "justify-end" : "justify-start")}
                  >
                    <div className="relative">
                      <div onClick={() => select(item.id)} className="cursor-pointer">
                        <VoiceNoteBubble
                          id={item.id}
                          durationSeconds={item.voiceDurationSeconds ?? 0}
                          barHeights={item.voiceBarHeights}
                          isMe={item.sender === "me"}
                        />
                      </div>
                      {item.reaction && (
                        <span className="absolute -bottom-2.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-bg-elevated px-1 text-[11px] leading-none">
                          {item.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.type === "post") {
                return (
                  <div
                    key={item.id}
                    data-item-id={item.id}
                    className={cn("flex", item.sender === "me" ? "justify-end" : "justify-start")}
                  >
                    <div className="relative">
                      <div onClick={() => select(item.id)} className="cursor-pointer">
                        <PostCard
                          thumbnail={item.postThumbnail}
                          ownerUsername={item.postOwnerUsername}
                          ownerAvatar={item.postOwnerAvatar}
                          verified={item.postVerified}
                          caption={item.postCaption}
                          isCarousel={item.postIsCarousel}
                        />
                      </div>
                      {item.reaction && (
                        <span className="absolute -bottom-2.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-bg-elevated px-1 text-[11px] leading-none">
                          {item.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              const isCall = item.type === "call";
              return (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  className={cn("flex", item.sender === "me" ? "justify-end" : "justify-start")}
                >
                  <div className={cn("relative", item.reaction && "mb-2")}>
                    {isCall ? (
                      <div
                        onClick={() => select(item.id)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-border bg-surface py-2 pl-2 pr-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-elevated">
                          <CallIcon
                            kind={item.callKind ?? "audio"}
                            phase={item.callPhase ?? "started"}
                            className="h-4 w-4 text-foreground-muted"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold leading-tight text-foreground">
                            {formatCallTitle(item.callKind ?? "audio", item.callPhase ?? "started")}
                          </span>
                          <span className="text-[11px] leading-tight text-foreground-subtle">
                            {formatCallTime(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => select(item.id)}
                        className={cn(
                          "max-w-[75%] cursor-pointer whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                          item.sender === "me"
                            ? "bg-accent text-accent-foreground"
                            : "border border-border bg-surface text-foreground",
                        )}
                      >
                        {item.content}
                      </div>
                    )}
                    {item.reaction && (
                      <span className="absolute -bottom-2.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-bg-elevated px-1 text-[11px] leading-none">
                        {item.reaction}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
