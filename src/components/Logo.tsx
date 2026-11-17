import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`relative inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-paper ${className}`}
        >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-accent" />
        </span>
    );
}

export default function Logo({ href = "/" }: { href?: string }) {
    return (
        <Link href={href} className="inline-flex items-center gap-2.5 rounded-lg text-[17px] font-semibold tracking-tight text-ink">
            <LogoMark />
            <span>
                Support<span className="text-accent">AI</span>
            </span>
        </Link>
    );
}
