export const SYSTEM_MESSAGE_PRESETS: { label: string; template: string }[] = [
  { label: "You visited your blend.", template: "You visited your **blend**." },
  { label: "Recipient visited your blend.", template: "{name} visited your **blend**." },
];

export function SystemPresetButtons({ onSelect }: { onSelect: (template: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {SYSTEM_MESSAGE_PRESETS.map((preset) => (
        <button
          key={preset.template}
          type="button"
          onClick={() => onSelect(preset.template)}
          className="rounded-md border border-border px-2.5 py-1.5 text-left text-[12px] text-foreground hover:border-accent/50 hover:glass-surface"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
