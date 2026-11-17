'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from "motion/react"

type Status = { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string }

async function readError(res: Response, fallback: string) {
    try {
        const data = await res.json()
        return typeof data?.message === "string" ? data.message : fallback
    } catch {
        return fallback
    }
}

function DashboardClient() {
    const [businessName, setBusinessName] = useState("")
    const [supportEmail, setSupportEmail] = useState("")
    const [knowledge, setKnowledge] = useState("")
    const [loading, setLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [status, setStatus] = useState<Status>({ kind: "idle" })

    useEffect(() => {
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
                setBusinessName(data?.businessName ?? "")
                setSupportEmail(data?.supportEmail ?? "")
                setKnowledge(data?.knowledge ?? "")
            } catch (error) {
                if (!cancelled) {
                    setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not load your settings." })
                }
            } finally {
                if (!cancelled) setLoaded(true)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const handleSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus({ kind: "idle" })
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessName, supportEmail, knowledge }),
            })
            if (!res.ok) throw new Error(await readError(res, "Could not save your settings."))
            setStatus({ kind: "saved" })
            setTimeout(() => setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s)), 3000)
        } catch (error) {
            setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not save your settings." })
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 disabled:bg-zinc-50'

    return (
        <div className='min-h-screen bg-zinc-50 text-zinc-900'>
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className='fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200'
            >
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <Link href="/" className='text-lg font-semibold tracking-tight'>Support <span className='text-zinc-400'>AI</span></Link>
                    <Link href="/embed" className='px-4 py-2 rounded-lg border border-zinc-300 text-sm hover:bg-zinc-100 transition'>Embed ChatBot</Link>
                </div>
            </motion.div>

            <div className='flex justify-center px-4 py-14 mt-20'>
                <form onSubmit={handleSettings} className='w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10'>
                    <div className='mb-10'>
                        <h1 className='text-2xl font-semibold'>ChatBot Settings</h1>
                        <p className='text-zinc-500 mt-1'>Manage your AI chatbot knowledge and business details</p>
                    </div>

                    <div className='mb-10'>
                        <h2 className='text-lg font-medium mb-4'>Business Details</h2>
                        <div className='space-y-4'>
                            <input type="text" aria-label='Business name' className={inputClass} placeholder='Business Name' maxLength={120} disabled={!loaded} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                            <input type="email" aria-label='Support email' className={inputClass} placeholder='Support Email' maxLength={254} disabled={!loaded} value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className='mb-10'>
                        <h2 className='text-lg font-medium mb-4'>Knowledge Base</h2>
                        <p className='text-sm text-zinc-500 mb-4'>Add FAQs, policies, delivery info, refunds, etc.</p>
                        <textarea aria-label='Knowledge base' className={`${inputClass} h-54`} maxLength={20000} disabled={!loaded} placeholder={`Example:
• Refund policy: 7 days return available
• Delivery time: 3–5 working days
• Cash on Delivery available
• Support hours`} onChange={(e) => setKnowledge(e.target.value)} value={knowledge} />
                        <p className='text-xs text-zinc-400 mt-1 text-right'>{knowledge.length.toLocaleString()} / 20,000</p>
                    </div>

                    <div className='flex items-center gap-5'>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={loading || !loaded}
                            className="px-7 py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Save"}
                        </motion.button>
                        <span role="status" aria-live="polite">
                            {status.kind === "saved" && <span className="text-sm font-medium text-emerald-600">✓ Settings saved</span>}
                            {status.kind === "error" && <span className="text-sm font-medium text-red-600">{status.message}</span>}
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DashboardClient
