"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, List, Bell } from "lucide-react";
import { CategoryCard } from "@/components/generators/category-card";

export default function InstagramGeneratorPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden px-8 py-6">
      <header className="mb-6 shrink-0 text-center">
        <p className="text-[13px] text-foreground-subtle">Generators</p>
        <h1 className="mt-1 text-xl font-medium text-foreground">Instagram</h1>
        <p className="mt-1 text-[13px] text-foreground-muted">
          Pick what you want to simulate.
        </p>
      </header>

      <div className="flex h-[68vh] shrink-0 gap-3">
        <CategoryCard
          title="Conversations"
          description="A DM thread — normal conversations or message requests."
          icon={MessageCircle}
          image="/generators/instagram/conversations.png"
          onClick={() => router.push("/generators/instagram/conversations")}
        />
        <CategoryCard
          title="Chat List"
          description="The inbox screen listing multiple conversations — name, avatar, snippet, and time."
          icon={List}
          image="/generators/instagram/chat-list.png"
          onClick={() => router.push("/projects/chat-list")}
        />
        <CategoryCard
          title="Notifications"
          description="The activity feed — likes, comments, follows, and other notification rows."
          icon={Bell}
          image="/generators/instagram/notifications.png"
          soon
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
