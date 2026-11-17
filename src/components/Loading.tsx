// Shared loading UI: shimmer placeholders and a small spinner.

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return <div aria-hidden="true" className={`skeleton ${className}`} style={style} />
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`animate-spin motion-reduce:animate-none ${className}`}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    )
}

// Announces the loading state to screen readers while skeletons are visible.
export function LoadingAnnouncement({ label }: { label: string }) {
    return (
        <p role="status" className="sr-only">
            {label}
        </p>
    )
}
