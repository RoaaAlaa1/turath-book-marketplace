export function BranchDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-primary/60 ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-current sm:w-28" />
      <svg viewBox="0 0 120 24" className="h-6 w-28 shrink-0" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M6 12h30M84 12h30" />
          <path d="M40 12c4-6 10-6 14 0-4 6-10 6-14 0Z" />
          <path d="M66 12c4-6 10-6 14 0-4 6-10 6-14 0Z" />
          <path d="M60 5v14M54 9l6 3M66 9l-6 3" />
        </g>
        <circle cx="60" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-current sm:w-28" />
    </div>
  );
}

export function LeafSprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M32 60C32 40 24 20 8 8" />
        <path d="M26 44c-8 2-14-2-16-8 7-2 13 1 16 8ZM22 32c-7 1-12-3-13-9 6-1 11 2 13 9ZM30 52c6-4 7-11 4-16-5 3-7 10-4 16Z" />
      </g>
    </svg>
  );
}
