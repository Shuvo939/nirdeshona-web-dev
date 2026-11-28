/**
 * Page-header backdrop: a drafting-sheet grid (fine lines every 24px, stronger
 * every 120px) and a sky-blue wash. Both start at the top edge and fade out
 * downward — the same on every device. Theme tokens; dark mode has its own
 * strength. Decorative. (`focus` is kept for existing call sites.)
 */
export default function BlueprintBackdrop({ focus = "right", className = "" }: { focus?: "right" | "header"; className?: string }) {
  return (
    <div aria-hidden className={`blueprint blueprint--${focus} ${className}`}>
      <div className="blueprint__wash" />
      <div className="blueprint__grid" />
      <div className="blueprint__fade" />
    </div>
  );
}
