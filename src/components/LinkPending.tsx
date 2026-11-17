'use client'
import { useLinkStatus } from 'next/link'
import { Spinner } from './Loading'

// Place inside a <Link>. Shows a spinner while that link's navigation is in progress.
export default function LinkPending({ className = "h-3.5 w-3.5" }: { className?: string }) {
    const { pending } = useLinkStatus()
    if (!pending) return null
    return <Spinner className={className} />
}
