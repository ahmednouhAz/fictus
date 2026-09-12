import type { CallKind, CallPhase } from "@/schemas/conversation-item";

export function CallIcon({
  kind,
  phase,
  className,
}: {
  kind: CallKind;
  phase: CallPhase;
  className?: string;
}) {
  void phase;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={kind === "video" ? "/icons/video-call-filled.svg" : "/icons/voice-call.svg"}
      alt=""
      className={className}
    />
  );
}
