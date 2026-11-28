/**
 * Page-header backdrop: a drafting-sheet grid (fine lines every 24px, stronger
 * every 120px) that fades toward the edges, a sky-blue wash that starts at the
 * top and fades away downward, and a soft emerald light near the main visual.
 * Colours come from theme tokens (dark mode has its own strengths). Decorative.
 *
 * focus="right"  — home hero / project header (light gathers behind the visual)
 * focus="header" — ordinary page headers (light top-right, wash across the top)
 */
export default function BlueprintBackdrop({ focus = "right", className = "" }: { focus?: "right" | "header"; className?: string }) {
  return (
    <div aria-hidden className={`blueprint blueprint--${focus} ${className}`}>
      <div className="blueprint__wash" />
      <div className="blueprint__grid" />
      <div className="blueprint__glow" />
      <div className="blueprint__fade" />
    </div>
  );
}
