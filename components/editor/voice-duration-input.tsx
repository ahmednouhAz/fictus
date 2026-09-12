"use client";

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function VoiceDurationInput({
  seconds,
  onChange,
}: {
  seconds: number;
  onChange: (seconds: number) => void;
}) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex h-8 w-fit items-center gap-0.5 rounded-md border border-white/10 bg-black/40 backdrop-blur-md px-1.5">
      <input
        type="number"
        value={minutes}
        min={0}
        max={59}
        onChange={(e) => onChange(clamp(Number(e.target.value), 0, 59) * 60 + secs)}
        className="w-6 bg-transparent text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-[13px] text-foreground-subtle">:</span>
      <input
        type="number"
        value={String(secs).padStart(2, "0")}
        min={0}
        max={59}
        onChange={(e) => onChange(minutes * 60 + clamp(Number(e.target.value), 0, 59))}
        className="w-6 bg-transparent text-center text-[13px] text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}
