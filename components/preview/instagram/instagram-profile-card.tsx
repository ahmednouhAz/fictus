import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { cn } from "@/lib/utils";
import type { ProfileCardRelationship } from "@/schemas/project";

function relationshipSegments(
  relationship: ProfileCardRelationship | undefined,
  followedSinceYear: number | undefined,
): { text: string }[] {
  switch (relationship) {
    case "mutual":
      return [{ text: "You follow each other on Instagram" }];
    case "followsYou":
      return [{ text: "Follows you" }];
    case "followedSince":
      return [{ text: `You've followed this Instagram account since ${followedSinceYear ?? ""}` }];
    case "notMutual":
      return [{ text: "You don't follow each other on Instagram" }];
    default:
      return [];
  }
}

// The big centered profile summary Instagram shows at the very top of a
// DM's scroll history (not a sticky header — it's the first thing in the
// scrollable content, same as the real app).
export function InstagramProfileCard({
  recipientName,
  recipientNameHidden,
  recipientUsername,
  recipientAvatar,
  recipientVerified,
  followers,
  posts,
  relationship,
  followedSinceYear,
  note,
  showViewProfileButton,
  theme,
}: {
  recipientName: string;
  recipientNameHidden?: boolean;
  recipientUsername?: string;
  recipientAvatar?: string;
  recipientVerified?: boolean;
  followers?: string;
  posts?: number;
  relationship?: ProfileCardRelationship;
  followedSinceYear?: number;
  note?: string;
  showViewProfileButton?: boolean;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  const segments = relationshipSegments(relationship, followedSinceYear);
  const hasDisplayName = !recipientNameHidden && recipientName.trim().length > 0;
  const titleText = hasDisplayName ? recipientName : recipientUsername;
  const mutedClass = cn(!isLight && "text-[#A1A8AE]");
  const mutedStyle = isLight ? { color: "#6E6E70" } : undefined;

  return (
    <div
      className={cn(
        "flex flex-col items-center pb-6 text-center",
        isLight ? "text-black" : "text-white",
      )}
      style={{ paddingTop: 30 }}
    >
      <InstagramAvatar
        name={recipientName}
        avatarUrl={recipientAvatar}
        size={92}
        story="none"
      />
      <div style={{ height: 7 }} />
      <p
        style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}
        className="flex items-center gap-1.5"
      >
        {titleText}
        {recipientVerified && <VerifiedBadge size={17} />}
      </p>
      {hasDisplayName && recipientUsername && (
        <>
          <div style={{ height: 5 }} />
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.2, ...mutedStyle }} className={mutedClass}>
            {recipientUsername}
          </p>
        </>
      )}
      <div style={{ height: 4 }} />
      <p style={{ fontSize: 16, ...mutedStyle }} className={mutedClass}>
        {followers ?? 0} followers &middot; {posts ?? 0} posts
      </p>
      {segments.length > 0 && (
        <>
          <div style={{ height: 0 }} />
          <p style={{ fontSize: 16, ...mutedStyle }} className={cn("max-w-[85%]", mutedClass)}>
            {segments.map((segment) => segment.text).join("")}
          </p>
        </>
      )}
      {note && (
        <>
          <div style={{ height: 0 }} />
          <p style={{ fontSize: 16, ...mutedStyle }} className={cn("max-w-[85%]", mutedClass)}>
            {note}
          </p>
        </>
      )}
      {showViewProfileButton && (
        <>
          <div style={{ height: 12 }} />
          <button
            type="button"
            className={cn("flex items-center justify-center font-medium", isLight ? "text-black" : "text-white")}
            style={{
              height: 32,
              width: 113,
              borderRadius: 8,
              fontSize: 14,
              backgroundColor: isLight ? "#F0F1F5" : "#293036",
            }}
          >
            View profile
          </button>
        </>
      )}
    </div>
  );
}
