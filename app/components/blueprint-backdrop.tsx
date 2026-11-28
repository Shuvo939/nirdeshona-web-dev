/**
 * Hero backdrop: a drafting-sheet grid (fine lines every 24px, stronger every
 * 120px) that fades out toward the edges, plus soft emerald and sky light where
 * the main visual sits. Colours come from theme tokens, so dark mode gets its
 * own version automatically. Purely decorative.
 */
export default function BlueprintBackdrop({ focus = "right" }: { focus?: "right" | "center" }) {
  return (
    <div aria-hidden className={`blueprint blueprint--${focus}`}>
      <div className="blueprint__grid" />
      <div className="blueprint__glow blueprint__glow--a" />
      <div className="blueprint__glow blueprint__glow--b" />
      <div className="blueprint__fade" />
    </div>
  );
}
