"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Mail } from "lucide-react";
import { CategoryCard } from "@/components/generators/category-card";
import { useProjectStore } from "@/stores/useProjectStore";

export default function InstagramConversationsGeneratorPage() {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);

  function handleCreateMessageRequest() {
    const project = createProject("instagram", undefined, "messageRequest");
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden px-8 py-6">
      <header className="mb-6 shrink-0 text-center">
        <p className="text-[13px] text-foreground-subtle">Generators / Instagram</p>
        <h1 className="mt-1 text-xl font-medium text-foreground">Conversations</h1>
        <p className="mt-1 text-[13px] text-foreground-muted">
          Pick the kind of conversation you want to simulate.
        </p>
      </header>

      <div className="flex h-[68vh] shrink-0 gap-3">
        <CategoryCard
          title="Normal Conversations"
          description="A single DM thread between you and a recipient, scrolled to any moment."
          icon={MessageCircle}
          image="/generators/instagram/normal-conversations.png"
          onClick={() => router.push("/projects")}
        />
        <CategoryCard
          title="Message Requests"
          description="A pending request from a stranger — only their messages, with an accept/decline bar."
          icon={Mail}
          image="/generators/instagram/message-requests.png"
          onClick={handleCreateMessageRequest}
        />
      </div>
    </div>
  );
}
