import { cn } from "@/lib/utils";

export function InstagramTimestampDivider({
  label,
  theme,
}: {
  label: string;
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  return (
    <div className="flex justify-center py-3">
      <span className={cn("text-[11px] font-medium", !isLight && "text-white/40")} style={isLight ? { color: "#6E6E70" } : undefined}>
        {label}
      </span>
    </div>
  );
}
