'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import UserMenu from './UserMenu'

const TABS = [
    { href: "/dashboard", label: "Bot settings" },
    { href: "/embed", label: "Install" },
]

export default function AppHeader({ email }: { email: string }) {
    const pathname = usePathname()
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex items-center gap-6">
                    <Logo />
                    <nav aria-label="App" className="hidden items-center gap-1 sm:flex">
                        {TABS.map((t) => {
                            const active = pathname.startsWith(t.href)
                            return (
                                <Link
                                    key={t.href}
                                    href={t.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`rounded-lg px-3 py-1.5 text-sm transition ${active ? "bg-card font-medium text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
                                >
                                    {t.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <UserMenu email={email} />
            </div>
            {/* Mobile tabs */}
            <nav aria-label="App" className="flex gap-1 border-t border-line px-4 py-2 sm:hidden">
                {TABS.map((t) => {
                    const active = pathname.startsWith(t.href)
                    return (
                        <Link
                            key={t.href}
                            href={t.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex-1 rounded-lg px-3 py-1.5 text-center text-sm ${active ? "bg-card font-medium text-ink ring-1 ring-line" : "text-muted"}`}
                        >
                            {t.label}
                        </Link>
                    )
                })}
            </nav>
        </header>
    )
}
