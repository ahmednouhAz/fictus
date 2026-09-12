export function resolveSystemTemplate(template: string, recipientName: string): string {
  return template.replaceAll("{name}", recipientName);
}

export type SystemTemplateSegment = { text: string; bold: boolean };

export function parseSystemTemplate(template: string, recipientName: string): SystemTemplateSegment[] {
  const resolved = resolveSystemTemplate(template, recipientName);
  const segments: SystemTemplateSegment[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(resolved)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: resolved.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < resolved.length) {
    segments.push({ text: resolved.slice(lastIndex), bold: false });
  }

  return segments;
}
