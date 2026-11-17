'use client'
import { useEffect, useState } from 'react'
import { Spinner } from './Loading'

// Login leaves the site (to the sign-in provider), so show feedback until the browser navigates away.
export default function LoginLink({ className, children }: { className: string; children: React.ReactNode }) {
    const [pending, setPending] = useState(false)

    // Reset if the user comes back with the browser's Back button (page restored from cache).
    useEffect(() => {
        const reset = (e: PageTransitionEvent) => { if (e.persisted) setPending(false) }
        window.addEventListener("pageshow", reset)
        return () => window.removeEventListener("pageshow", reset)
    }, [])

    return (
        <a
            href="/api/auth/login"
            onClick={(e) => {
                if (pending) { e.preventDefault(); return }
                setPending(true)
            }}
            aria-busy={pending}
            aria-disabled={pending}
            className={`${className} inline-flex items-center justify-center gap-2 ${pending ? "pointer-events-none opacity-80" : ""}`}
        >
            {pending && <Spinner className="h-3.5 w-3.5" />}
            {pending ? "Redirecting…" : children}
        </a>
    )
}
