'use client'
import Link from 'next/link'
import { useState } from 'react'

const PLATFORMS = [
    {
        id: "html",
        label: "HTML",
        steps: [
            "Open your website's HTML file (often index.html).",
            "Paste the code just before the closing </body> tag.",
            "Save and upload the file. The chat bubble appears in the bottom-right corner.",
        ],
    },
    {
        id: "wordpress",
        label: "WordPress",
        steps: [
            "Install a plugin such as “WPCode” or “Insert Headers and Footers”.",
            "Open its Footer section and paste the code.",
            "Save. The chat appears on every page of your site.",
        ],
    },
    {
        id: "shopify",
        label: "Shopify",
        steps: [
            "Go to Online Store → Themes → ⋯ → Edit code.",
            "Open layout/theme.liquid and paste the code just before </body>.",
            "Save, then open your store to see the chat.",
        ],
    },
    {
        id: "wix",
        label: "Wix",
        steps: [
            "Go to Settings → Custom code → + Add custom code.",
            "Paste the code, choose “All pages” and place it in “Body - end”.",
            "Apply and publish your site.",
        ],
    },
]

export default function EmbedClient({ ownerId }: { ownerId: string }) {
    const [copied, setCopied] = useState(false)
    const [platform, setPlatform] = useState(PLATFORMS[0].id)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
    const embedCode = `<script\n  src="${appUrl}/chatBot.js"\n  data-owner-id="${ownerId}">\n</script>`
    const active = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0]

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(embedCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be blocked (e.g. non-HTTPS); the code is still selectable.
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Install on your website</h1>
                <p className="mt-1 text-muted">One line of code. No plugins to configure, no design changes needed.</p>
            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-6">
                    {/* Step 1 */}
                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink">1</span>
                            <h2 className="font-semibold">Copy your code</h2>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-md bg-ink text-paper">
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                                <span className="text-xs text-paper/60">Your personal snippet</span>
                                <button
                                    type="button"
                                    onClick={copyCode}
                                    className={`rounded-lg px-3 py-1 text-xs font-medium transition ${copied ? "bg-accent text-white" : "bg-paper text-ink hover:bg-white"}`}
                                >
                                    {copied ? "Copied ✓" : "Copy code"}
                                </button>
                            </div>
                            <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed"><code>{embedCode}</code></pre>
                        </div>
                        <p className="mt-3 text-xs text-muted">
                            This code is safe to put on a public website. It only lets visitors chat; nobody can change your settings with it.
                        </p>
                    </section>

                    {/* Step 2 */}
                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink">2</span>
                            <h2 className="font-semibold">Paste it into your site</h2>
                        </div>
                        <div role="tablist" aria-label="Website platform" className="mt-5 flex flex-wrap gap-1 rounded-md bg-paper p-1 ring-1 ring-line">
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    role="tab"
                                    id={`tab-${p.id}`}
                                    aria-selected={platform === p.id}
                                    aria-controls={`panel-${p.id}`}
                                    onClick={() => setPlatform(p.id)}
                                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition ${platform === p.id ? "bg-card font-medium text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <ol id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}`} className="mt-5 space-y-3">
                            {active.steps.map((s, i) => (
                                <li key={s} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper text-[11px] font-medium text-muted ring-1 ring-line">{i + 1}</span>
                                    {s}
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Step 3 */}
                    <section className="rounded-lg border border-line bg-card p-5 sm:p-7">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink">3</span>
                            <h2 className="font-semibold">Check it works</h2>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted">
                            Open your website, click the chat bubble and ask a question. Not happy with an answer?{" "}
                            <Link href="/dashboard" className="font-medium text-accent underline-offset-2 hover:underline">Update your knowledge</Link>{" "}
                            and it changes instantly, with no reinstall needed.
                        </p>
                    </section>
                </div>

                {/* Preview */}
                <aside className="lg:sticky lg:top-24">
                    <p className="mb-3 text-sm font-medium text-muted">How it looks on your site</p>
                    <div className="overflow-hidden rounded-lg border border-line bg-card" role="img" aria-label="Preview of the chat widget on a website">
                        <div className="relative h-100 bg-paper p-5">
                            <div className="absolute bottom-20 left-4 right-4 overflow-hidden rounded-lg border border-line bg-card shadow-xl">
                                <div className="flex items-center gap-2.5 bg-ink px-3.5 py-2.5 text-paper">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[10px] font-semibold">AI</span>
                                    <div className="leading-tight">
                                        <p className="text-[13px] font-medium">Customer support</p>
                                        <p className="text-[10px] text-paper/65">Usually replies in a few seconds</p>
                                    </div>
                                </div>
                                <div className="space-y-2 bg-paper/60 p-3 text-xs">
                                    <p className="w-fit max-w-[85%] rounded-lg rounded-bl-sm bg-card px-3 py-2 ring-1 ring-line">Hi! How can we help?</p>
                                    <p className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-ink px-3 py-2 text-paper">What is your return policy?</p>
                                    <p className="w-fit max-w-[85%] rounded-lg rounded-bl-sm bg-card px-3 py-2 ring-1 ring-line">You can return any item within 7 days for a full refund.</p>
                                </div>
                                <div className="flex gap-2 border-t border-line p-2.5">
                                    <span className="flex-1 rounded-lg border border-line-strong px-2.5 py-1.5 text-[11px] text-faint">Type your question…</span>
                                    <span className="rounded-lg bg-ink px-3 py-1.5 text-[11px] text-paper">Send</span>
                                </div>
                            </div>
                            <span className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-lg">
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}
