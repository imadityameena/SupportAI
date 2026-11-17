'use client'
import { useEffect, useRef, useState } from 'react'

type Message = { role: "user" | "ai"; text: string; error?: boolean }

const SUGGESTIONS = ["What are your opening hours?", "Do you offer refunds?", "How can I contact you?"]

export default function TestChat({
    ownerId,
    businessName,
    hasUnsavedChanges,
}: {
    ownerId: string
    businessName: string
    hasUnsavedChanges: boolean
}) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }, [messages, sending])

    const send = async (raw: string) => {
        const text = raw.trim().slice(0, 1000)
        if (!text || sending) return
        const history = messages.filter((m) => !m.error).slice(-10).map(({ role, text }) => ({ role, text }))
        setMessages((m) => [...m, { role: "user", text }])
        setInput("")
        setSending(true)
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ownerId, message: text, history }),
            })
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                const msg = res.status === 404
                    ? "Save your settings first, then try again."
                    : data?.message || "Could not get a reply. Please try again."
                throw new Error(msg)
            }
            setMessages((m) => [...m, { role: "ai", text: data?.message ?? "" }])
        } catch (error) {
            setMessages((m) => [...m, { role: "ai", text: error instanceof Error ? error.message : "Something went wrong.", error: true }])
        } finally {
            setSending(false)
        }
    }

    const name = businessName.trim() || "Your business"

    return (
        <section aria-labelledby="test-chat-title" className="flex h-[min(640px,calc(100vh-7rem))] min-h-120 flex-col overflow-hidden rounded-lg border border-line bg-card">
            <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-paper">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-bright text-xs font-semibold uppercase text-white">
                        {name.slice(0, 2)}
                    </span>
                    <div className="leading-tight">
                        <h2 id="test-chat-title" className="text-sm font-medium">{name}</h2>
                        <p className="text-[11px] text-paper/65">Test chat · uses your saved settings</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button type="button" onClick={() => setMessages([])} className="rounded-md px-2 py-1 text-xs text-paper/70 hover:bg-white/10 hover:text-paper">
                        Clear
                    </button>
                )}
            </div>

            {hasUnsavedChanges && (
                <p className="border-b border-sun/40 bg-sun/15 px-4 py-2 text-xs text-ink-soft">
                    You have unsaved changes. The bot answers from your <strong>saved</strong> settings.
                </p>
            )}

            <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 space-y-2.5 overflow-y-auto bg-paper/60 p-4 text-sm">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <p className="text-base font-semibold text-ink">Try your bot</p>
                        <p className="mt-1 max-w-60 text-xs text-muted">Ask what your customers would ask. Replies use exactly what the widget will use.</p>
                        <div className="mt-5 flex flex-col gap-2">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => send(s)}
                                    className="rounded-md bg-card px-3 py-1.5 text-xs text-ink-soft ring-1 ring-line transition hover:ring-ink"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <p
                            key={i}
                            className={`rise-in w-fit max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 leading-snug ${m.role === "user"
                                ? "ml-auto rounded-br-sm bg-accent text-white"
                                : m.error
                                    ? "rounded-bl-sm bg-danger-soft text-danger ring-1 ring-danger/20"
                                    : "rounded-bl-sm bg-card text-ink ring-1 ring-line"}`}
                        >
                            {m.text}
                        </p>
                    ))
                )}
                {sending && (
                    <p className="flex w-fit gap-1 rounded-lg rounded-bl-sm bg-card px-3 py-3 ring-1 ring-line" aria-label="Typing">
                        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-faint" />
                        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-faint" style={{ animationDelay: "0.15s" }} />
                        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-faint" style={{ animationDelay: "0.3s" }} />
                    </p>
                )}
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); send(input) }}
                className="flex gap-2 border-t border-line bg-card p-3"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={1000}
                    placeholder="Ask a question…"
                    aria-label="Test message"
                    className="min-w-0 flex-1 rounded-md border border-line-strong bg-card px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
                >
                    Send
                </button>
            </form>
        </section>
    )
}
