import type { Metadata } from 'next'
import AppHeader from '@/components/AppHeader'
import EmbedClient from '@/components/EmbedClient'
import { getSession } from '@/lib/getSession'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: "Install" }

export default async function EmbedPage() {
  const session = await getSession()
  if (!session?.id) {
    redirect("/")
  }

  return (
    <div className="min-h-screen">
      <AppHeader email={session.email} />
      <EmbedClient ownerId={session.id} />
    </div>
  )
}
