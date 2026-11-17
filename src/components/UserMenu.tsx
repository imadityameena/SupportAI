'use client'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

export default function UserMenu({ email }: { email: string }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const menuId = useId()
    const initial = email ? email[0].toUpperCase() : "?"

    useEffect(() => {
        if (!open) return
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={open}
                aria-controls={menuId}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper transition hover:bg-ink-soft"
            >
                {initial}
            </button>
            {open && (
                <div
                    id={menuId}
                    className="rise-in absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-md border border-line bg-card shadow-lg"
                >
                    <div className="border-b border-line px-4 py-3">
                        <p className="text-xs text-faint">Signed in as</p>
                        <p className="truncate text-sm font-medium text-ink">{email || "your account"}</p>
                    </div>
                    <nav className="p-1.5 text-sm">
                        <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-paper">
                            Bot settings
                        </Link>
                        <Link href="/embed" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-paper">
                            Install on your site
                        </Link>
                        {/* A real form POST: logout works even before JS loads. */}
                        <form action="/api/auth/logout" method="post">
                            <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-danger hover:bg-danger-soft">
                                Log out
                            </button>
                        </form>
                    </nav>
                </div>
            )}
        </div>
    )
}
