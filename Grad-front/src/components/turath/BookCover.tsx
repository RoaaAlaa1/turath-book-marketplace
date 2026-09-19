import type { Book } from "@/lib/turath/types";

const spineStyles: Record<Book["spine"], { bg: string; ink: string }> = {
  rust: { bg: "oklch(0.52 0.13 40)", ink: "oklch(0.94 0.05 80)" },
  navy: { bg: "oklch(0.42 0.075 250)", ink: "oklch(0.93 0.04 85)" },
  amber: { bg: "oklch(0.68 0.11 78)", ink: "oklch(0.25 0.04 70)" },
  sage: { bg: "oklch(0.55 0.05 143)", ink: "oklch(0.95 0.03 90)" },
  crimson: { bg: "oklch(0.44 0.14 22)", ink: "oklch(0.93 0.05 80)" },
};

interface Props {
  book: Book;
  angle?: string;
  className?: string;
}

/** Prefer real cover images when the API provides them; fall back to the illustrated cloth cover only when no image exists. */
export function BookCover({ book, angle = "front", className = "" }: Props) {
  const imageUrl = book.images?.find((url) => Boolean(url) && url !== "__REAL_COVER_URL_REQUIRED__");

  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-sm bg-muted ${className}`}
        role="img"
        aria-label={`${book.title} by ${book.author}, ${angle} view`}
      >
        <img
          src={imageUrl}
          alt={`${book.title} cover`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  const s = spineStyles[book.spine];
  const detail = angle !== "front";

  return (
    <div
      className={`relative overflow-hidden rounded-sm ${className}`}
      style={{
        background: `linear-gradient(120deg, ${s.bg}, color-mix(in oklab, ${s.bg} 78%, black))`,
        color: s.ink,
      }}
      role="img"
      aria-label={`${book.title} by ${book.author}, ${angle} view`}
    >
      <span
        className="absolute inset-y-0 left-0 w-[9%]"
        style={{ background: "color-mix(in oklab, black 22%, transparent)" }}
      />
      <span
        className="absolute inset-2 rounded-[2px] border"
        style={{ borderColor: "color-mix(in oklab, currentColor 35%, transparent)" }}
      />
      {detail && (
        <span
          className="absolute inset-y-0 right-0 w-[16%]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, oklch(0.93 0.02 85), oklch(0.93 0.02 85) 1px, oklch(0.86 0.03 84) 2px, oklch(0.86 0.03 84) 3px)",
          }}
        />
      )}
      <div className="relative flex h-full flex-col items-center justify-between px-4 py-6 text-center">
        <svg viewBox="0 0 40 12" className="h-3 w-10 opacity-70" aria-hidden="true">
          <path
            d="M2 6h12M26 6h12M20 1c3 2 3 8 0 10-3-2-3-8 0-10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <div className="space-y-1">
          {book.titleAr && (
            <p className="font-arabic-display text-lg leading-tight opacity-90">{book.titleAr}</p>
          )}
          <p className="font-display text-[0.78rem] leading-snug font-semibold tracking-wide uppercase">
            {book.title}
          </p>
          <p className="text-[0.62rem] tracking-[0.18em] uppercase opacity-75">{book.author}</p>
        </div>
        <span
          className="block h-px w-10"
          style={{ background: "color-mix(in oklab, currentColor 50%, transparent)" }}
        />
      </div>
    </div>
  );
}
