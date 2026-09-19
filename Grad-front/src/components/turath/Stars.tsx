import { Star } from "lucide-react";

export function Stars({
  value,
  count,
  className = "",
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Rated ${value.toFixed(1)} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= Math.round(value) ? "fill-amber-gold text-amber-gold" : "text-border"}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {value ? value.toFixed(1) : "—"}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}
