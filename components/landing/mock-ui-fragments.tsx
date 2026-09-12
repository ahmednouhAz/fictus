import { Heart, MessageCircle, Send, Play, Bookmark } from "lucide-react";
import { InstagramAvatar } from "@/components/preview/instagram/instagram-avatar";
import { VerifiedBadge } from "@/components/preview/instagram/verified-badge";
import { GlassPanel } from "@/components/landing/glass-panel";
import { cn } from "@/lib/utils";

// Small, static illustrative fragments of the real product UI — reusing
// the same avatar/badge primitives and color language as the actual
// preview components, kept deliberately lightweight (no live state) since
// these only ever need to read as "a real interface", not function as one.

export function PostFragment({ className }: { className?: string }) {
  return (
    <GlassPanel className={cn("w-[220px] p-3", className)}>
      <div className="flex items-center gap-2">
        <InstagramAvatar name="mara" size={26} story="unseen" />
        <div className="flex flex-col leading-tight">
          <span className="flex items-center gap-1 text-[12px] font-semibold text-[#F5F5F5]">
            mara.codes <VerifiedBadge size={11} />
          </span>
          <span className="text-[10px] text-white/40">Reykjavik, Iceland</span>
        </div>
      </div>
      <div className="mt-2.5 aspect-[4/3] w-full rounded-2xl bg-[linear-gradient(135deg,#2a2f36_0%,#12151a_100%)]" />
      <div className="mt-2.5 flex items-center gap-3 text-white/70">
        <Heart className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
        <Send className="h-4 w-4" />
        <Bookmark className="ml-auto h-4 w-4" />
      </div>
      <p className="mt-1.5 text-[11px] text-white/50">
        <span className="font-semibold text-white/80">1,204 likes</span>
      </p>
    </GlassPanel>
  );
}

export function DmFragment({ className }: { className?: string }) {
  return (
    <GlassPanel className={cn("w-[210px] p-3", className)}>
      <div className="flex items-center gap-2 pb-2.5">
        <InstagramAvatar name="leo" size={22} />
        <span className="text-[12px] font-medium text-white/80">leo_writes</span>
        <span className="ml-auto h-2 w-2 rounded-full bg-[#5b8cff]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className="max-w-[80%] self-start rounded-2xl rounded-bl-md px-3 py-1.5 text-[11px] text-white"
          style={{ background: "linear-gradient(135deg,#B332D7 0%,#B4A1FB 100%)" }}
        >
          did you actually send that
        </div>
        <div className="max-w-[75%] self-end rounded-2xl rounded-br-md bg-[#181D21] px-3 py-1.5 text-[11px] text-white/90">
          maybe 👀
        </div>
      </div>
    </GlassPanel>
  );
}

export function NotificationFragment({ className }: { className?: string }) {
  return (
    <GlassPanel className={cn("w-[230px] p-3", className)}>
      <div className="flex items-center gap-2.5">
        <InstagramAvatar name="priya" size={30} />
        <p className="text-[11.5px] leading-snug text-white/70">
          <span className="font-semibold text-white/90">priya.nyc</span> and{" "}
          <span className="font-semibold text-white/90">312 others</span> liked
          your photo <span className="text-white/40">· 2m</span>
        </p>
        <div className="ml-auto h-9 w-9 shrink-0 rounded-lg bg-[linear-gradient(135deg,#2a2f36_0%,#12151a_100%)]" />
      </div>
    </GlassPanel>
  );
}

export function ProfileFragment({ className }: { className?: string }) {
  return (
    <GlassPanel className={cn("w-[200px] p-4", className)}>
      <div className="flex flex-col items-center text-center">
        <InstagramAvatar name="noa" size={56} story="unseen" />
        <span className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-white">
          noa.stills <VerifiedBadge size={12} />
        </span>
        <div className="mt-2.5 flex gap-4 text-[11px] text-white/60">
          <span>
            <b className="text-white/90">184</b> posts
          </span>
          <span>
            <b className="text-white/90">12.4k</b> followers
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}

export function VoiceMessageFragment({ className }: { className?: string }) {
  const bars = [6, 12, 18, 10, 22, 14, 9, 17, 11, 6];
  return (
    <GlassPanel className={cn("w-[200px] p-3", className)}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5b8cff]">
          <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" />
        </span>
        <div className="flex h-6 flex-1 items-center gap-[2px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-[2.5px] shrink-0 rounded-full bg-white/50"
              style={{ height: h }}
            />
          ))}
        </div>
        <span className="shrink-0 text-[10px] text-white/40">0:14</span>
      </div>
    </GlassPanel>
  );
}
