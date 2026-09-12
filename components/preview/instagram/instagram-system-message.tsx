import { parseSystemTemplate } from "@/lib/system-template";

export function InstagramSystemMessage({
  template,
  recipientName,
}: {
  template: string;
  recipientName: string;
}) {
  const segments = parseSystemTemplate(template, recipientName);

  return (
    <div className="flex justify-center py-2">
      <span className="max-w-[80%] text-center text-[12px] leading-snug text-white/45">
        {segments.map((seg, i) =>
          seg.bold ? (
            <strong key={i} className="font-semibold text-white/65">
              {seg.text}
            </strong>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </span>
    </div>
  );
}
