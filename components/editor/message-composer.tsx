"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/useEditorStore";
import { cn } from "@/lib/utils";
import type { MessageSender } from "@/schemas/conversation-item";

export function MessageComposer({ disableMeSender }: { disableMeSender?: boolean }) {
  const addMessage = useEditorStore((s) => s.addMessage);
  const [sender, setSender] = React.useState<MessageSender>(disableMeSender ? "recipient" : "me");
  const [content, setContent] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function submit() {
    if (!content.trim()) return;
    addMessage(disableMeSender ? "recipient" : sender, content);
    setContent("");
    textareaRef.current?.focus();
  }

  return (
    <div className="shrink-0 border-t border-border p-3">
      {!disableMeSender && (
        <div className="mb-2 flex items-center gap-1">
          <SenderToggleButton
            label="Me"
            active={sender === "me"}
            onClick={() => setSender("me")}
          />
          <SenderToggleButton
            label="Recipient"
            active={sender === "recipient"}
            onClick={() => setSender("recipient")}
          />
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Write a message…"
        rows={2}
        className="w-full resize-none rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground-subtle focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30"
      />
    </div>
  );
}

function SenderToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
        active
          ? "border-accent/50 bg-accent/15 text-accent"
          : "border-border text-foreground-subtle hover:text-foreground-muted",
      )}
    >
      {label}
    </button>
  );
}
