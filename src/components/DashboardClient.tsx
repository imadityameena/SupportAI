'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import TestChat from './TestChat'
import { Skeleton, Spinner } from './Loading'
import { SettingsFormSkeleton } from './PageSkeletons'

type Fields = { businessName: string; supportEmail: string; knowledge: string }
type Status = { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string }

const EMPTY: Fields = { businessName: "", supportEmail: "", knowledge: "" }
const KNOWLEDGE_MAX = 20000

const KNOWLEDGE_TIPS = [
    "Opening hours and holidays",
    "Prices, plans or menu",
    "Delivery areas, times and charges",
    "Payment methods",
    "Refund and return policy",
    "How to reach a human",
]

async function readError(res: Response, fallback: string) {
    try {
        const data = await res.json()
        return typeof data?.message === "string" ? data.message : fallback
    } catch {
        return fallback
    }
}

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="text-sm font-medium text-ink">{label}</label>
            {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
            <div className="mt-2">{children}</div>
        </div>
    )
}

const inputClass = "w-full rounded-md border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-paper disabled:text-faint"

export type { Fields as SettingsFields }

// initialSettings is loaded on the server with the page. If that failed (null),
// the settings are fetched from the browser instead, showing a skeleton meanwhile.
export default function DashboardClient({ ownerId, initialSettings }: { ownerId: string; initialSettings: Fields | null }) {
    const [fields, setFields] = useState<Fields>(initialSettings ?? EMPTY)
    const [saved, setSaved] = useState<Fields>(initialSettings ?? EMPTY)
    const [loaded, setLoaded] = useState(initialSettings !== null)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<Status>({ kind: "idle" })

    const dirty = loaded && (Object.keys(fields) as (keyof Fields)[]).some((k) => fields[k] !== saved[k])
    const isConfigured = !!(saved.businessName || saved.knowledge)

    useEffect(() => {
        if (initialSettings !== null) return
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch("/api/settings", { cache: "no-store" })
                if (res.status === 401) {
                    window.location.href = "/"
                    return
                }
                if (!res.ok) throw new Error(await readError(res, "Could not load your settings."))
                const data = await res.json()
                if (cancelled) return
                const next = {
                    businessName: data?.businessName ?? "",
                    supportEmail: data?.supportEmail ?? "",
                    knowledge: data?.knowledge ?? "",
                }
                setFields(next)
                setSaved(next)
            } catch (error) {
                if (!cancelled) setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not load your settings." })
            } finally {
                if (!cancelled) setLoaded(true)
            }
        }
        load()
        return () => { cancelled = true }
    }, [initialSettings])

    // Warn before leaving the page with unsaved edits.
    useEffect(() => {
        if (!dirty) return
        const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault() }
        window.addEventListener("beforeunload", onBeforeUnload)
        return () => window.removeEventListener("beforeunload", onBeforeUnload)
    }, [dirty])

    const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFields((f) => ({ ...f, [key]: e.target.value }))
        if (status.kind !== "idle") setStatus({ kind: "idle" })
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setStatus({ kind: "idle" })
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            })
            if (!res.ok) throw new Error(await readError(res, "Could not save your settings."))
            const data = await res.json()
            const next = {
                businessName: data?.businessName ?? fields.businessName,
                supportEmail: data?.supportEmail ?? fields.supportEmail,
                knowledge: data?.knowledge ?? fields.knowledge,
            }
            setFields(next)
            setSaved(next)
            setStatus({ kind: "saved" })
            setTimeout(() => setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s)), 3000)
        } catch (error) {
            setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not save your settings." })
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Bot settings</h1>
                    <p className="mt-1 text-muted">Everything your assistant knows comes from this page.</p>
                </div>
                {!loaded && <Skeleton className="h-6 w-28 rounded-full!" />}
                {loaded && (
                    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isConfigured ? "bg-accent-soft text-accent-ink" : "bg-sun/20 text-ink-soft"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isConfigured ? "bg-accent" : "bg-sun"}`} />
                        {isConfigured ? "Bot is ready" : "Not set up yet"}
                    </span>
                )}
            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
                <form onSubmit={handleSave} className="space-y-6" aria-busy={!loaded}>
                    {!loaded ? <SettingsFormSkeleton /> : (
                    <>
                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <h2 className="font-semibold">Business details</h2>
                        <p className="mt-0.5 text-sm text-muted">Shown to customers and used when the bot can&apos;t answer.</p>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <Field label="Business name" htmlFor="businessName">
                                <input id="businessName" type="text" className={inputClass} placeholder="e.g. BrewBean Café" maxLength={120} disabled={!loaded} value={fields.businessName} onChange={update("businessName")} />
                            </Field>
                            <Field label="Support email" htmlFor="supportEmail">
                                <input id="supportEmail" type="email" className={inputClass} placeholder="help@yourbusiness.com" maxLength={254} disabled={!loaded} value={fields.supportEmail} onChange={update("supportEmail")} />
                            </Field>
                        </div>
                    </section>

                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold">Knowledge</h2>
                                <p className="mt-0.5 text-sm text-muted">Write it like you&apos;d explain it to a new employee. The bot only answers from this.</p>
                            </div>
                        </div>
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Ideas for what to include">
                            {KNOWLEDGE_TIPS.map((t) => (
                                <li key={t} className="rounded-full bg-paper px-2.5 py-1 text-xs text-muted ring-1 ring-line">{t}</li>
                            ))}
                        </ul>
                        <label htmlFor="knowledge" className="sr-only">Knowledge</label>
                        <textarea
                            id="knowledge"
                            className={`${inputClass} mt-4 min-h-80 resize-y leading-relaxed`}
                            maxLength={KNOWLEDGE_MAX}
                            disabled={!loaded}
                            value={fields.knowledge}
                            onChange={update("knowledge")}
                            placeholder={`Opening hours: Mon–Sat 8am–9pm, closed Sundays.
Delivery: within 5 km, 30–45 minutes. Free above ₹299, otherwise ₹30.
Payment: UPI, cards and cash on delivery.
Refunds: wrong or damaged items are replaced or refunded within 24 hours.`}
                        />
                        <p className={`mt-1.5 text-right text-xs ${fields.knowledge.length > KNOWLEDGE_MAX * 0.9 ? "text-danger" : "text-faint"}`}>
                            {fields.knowledge.length.toLocaleString()} / {KNOWLEDGE_MAX.toLocaleString()}
                        </p>
                    </section>
                    </>
                    )}

                    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
                        <p role="status" aria-live="polite" className="text-sm">
                            {status.kind === "saved" && <span className="font-medium text-accent">✓ Saved. Your bot is using the new info.</span>}
                            {status.kind === "error" && <span className="font-medium text-danger">{status.message}</span>}
                            {status.kind === "idle" && (
                                <span className="text-muted">{!loaded ? "Loading…" : dirty ? "You have unsaved changes" : "All changes saved"}</span>
                            )}
                        </p>
                        <div className="flex items-center gap-2">
                            {dirty && (
                                <button type="button" onClick={() => { setFields(saved); setStatus({ kind: "idle" }) }} className="rounded-md px-4 py-2 text-sm text-muted hover:text-ink">
                                    Discard
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={saving || !loaded || !dirty}
                                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {saving && <Spinner className="h-3.5 w-3.5" />}
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    </div>
                </form>

                <aside className="space-y-4 lg:sticky lg:top-24">
                    <TestChat ownerId={ownerId} businessName={saved.businessName} hasUnsavedChanges={dirty} />
                    <Link href="/embed" className="flex items-center justify-between rounded-lg border border-line bg-card px-5 py-4 text-sm transition hover:border-accent">
                        <span>
                            <span className="block font-medium">Happy with the answers?</span>
                            <span className="text-muted">Install the widget on your website</span>
                        </span>
                        <span aria-hidden="true" className="text-lg">→</span>
                    </Link>
                </aside>
            </div>
        </main>
    )
}
