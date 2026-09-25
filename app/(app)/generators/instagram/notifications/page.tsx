"use client";

import { useRouter } from "next/navigation";
import { BellRing, UserPlus } from "lucide-react";
import { CategoryCard } from "@/components/generators/category-card";
import { useProjectStore } from "@/stores/useProjectStore";

export default function InstagramNotificationsGeneratorPage() {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);

  function handleCreate(kind: "notification" | "followRequests") {
    const project = createProject("instagram", undefined, undefined, kind);
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden px-8 py-6">
      <header className="mb-6 shrink-0 text-center">
        <p className="text-[13px] text-foreground-subtle">Generators / Instagram</p>
        <h1 className="mt-1 text-xl font-medium text-foreground">Notifications</h1>
        <p className="mt-1 text-[13px] text-foreground-muted">
          Pick the kind of notification you want to simulate.
        </p>
      </header>

      <div className="flex h-[68vh] shrink-0 gap-3">
        <CategoryCard
          title="Notification Overlay"
          description="Upload a screenshot and drop a push notification on top of it."
          icon={BellRing}
          image="/generators/instagram/notification-overlay.png"
          onClick={() => handleCreate("notification")}
        />
        <CategoryCard
          title="Follow Requests"
          description="The Follow Requests list — avatar, username, and Confirm/Delete."
          icon={UserPlus}
          image="/generators/instagram/follow-requests.png"
          onClick={() => handleCreate("followRequests")}
        />
      </div>
    </div>
  );
}
