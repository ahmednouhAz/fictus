// The source SVG is solid white (`fill="#FFFFFF"`), so a plain <img> can't
// be recolored via CSS — mask it into a solid tinted shape instead, same
// trick used for the tinted-purple verified badge on reel/story/post cards.
export function VerifiedBadge({ size = 14, color = "#0095F6" }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: "url(/icons/verified.svg)",
        maskImage: "url(/icons/verified.svg)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
