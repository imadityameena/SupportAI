import { LoadingAnnouncement, Skeleton } from './Loading'

// Field placeholders for the settings form; also used while settings load on the client.
export function SettingsFormSkeleton() {
    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {[0, 1].map((i) => (
                        <div key={i}>
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="mt-2 h-10.5 w-full" />
                        </div>
                    ))}
                </div>
            </section>
            <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-2 h-4 w-96 max-w-full" />
                <div className="mt-4 flex flex-wrap gap-2">
                    {[24, 28, 36, 26, 30, 32].map((w, i) => (
                        <Skeleton key={i} className="h-6 rounded-full!" style={{ width: `${w * 4}px` }} />
                    ))}
                </div>
                <Skeleton className="mt-4 h-80 w-full" />
            </section>
        </div>
    )
}

export function TestChatSkeleton() {
    return (
        <div className="flex h-[min(640px,calc(100vh-7rem))] min-h-120 flex-col overflow-hidden rounded-lg border border-line bg-card">
            <div className="flex items-center gap-3 bg-ink px-4 py-3">
                <span className="h-8 w-8 rounded-full bg-white/15" />
                <div className="space-y-1.5">
                    <span className="block h-3 w-24 rounded bg-white/20" />
                    <span className="block h-2.5 w-36 rounded bg-white/10" />
                </div>
            </div>
            <div className="flex-1 bg-paper/60 p-4">
                <div className="flex h-full flex-col items-center justify-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-52" />
                    <Skeleton className="mt-3 h-7 w-48" />
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-7 w-44" />
                </div>
            </div>
            <div className="flex gap-2 border-t border-line p-3">
                <Skeleton className="h-9.5 flex-1" />
                <Skeleton className="h-9.5 w-16" />
            </div>
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true">
            <LoadingAnnouncement label="Loading your bot settings…" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-5 w-80 max-w-full" />
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <SettingsFormSkeleton />
                <TestChatSkeleton />
            </div>
        </main>
    )
}

export function EmbedSkeleton() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true">
            <LoadingAnnouncement label="Loading install instructions…" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="mt-2 h-5 w-96 max-w-full" />
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-6">
                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <Skeleton className="h-6 w-40" />
                        <div className="mt-5 h-40 rounded-md bg-ink/90" />
                        <Skeleton className="mt-3 h-3 w-80 max-w-full" />
                    </section>
                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="mt-5 h-10 w-full" />
                        <div className="mt-5 space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </section>
                </div>
                <div>
                    <Skeleton className="mb-3 h-4 w-36" />
                    <Skeleton className="h-100 w-full rounded-lg!" />
                </div>
            </div>
        </main>
    )
}

export function HomeSkeleton() {
    return (
        <div className="min-h-screen" aria-busy="true">
            <LoadingAnnouncement label="Loading…" />
            <div className="border-b border-line">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20">
                <div>
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="mt-3 h-11 w-11/12" />
                    <Skeleton className="mt-3 h-11 w-2/3" />
                    <Skeleton className="mt-7 h-5 w-full" />
                    <Skeleton className="mt-2 h-5 w-5/6" />
                    <Skeleton className="mt-8 h-11 w-40" />
                </div>
                <Skeleton className="mx-auto h-90 w-full max-w-sm rounded-xl!" />
            </div>
        </div>
    )
}
