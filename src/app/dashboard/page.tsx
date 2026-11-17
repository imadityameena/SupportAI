import type { Metadata } from 'next'
import AppHeader from '@/components/AppHeader'
import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: "Bot settings" }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.id) {
    redirect("/")
  }

  return (
    <div className="min-h-screen">
      <AppHeader email={session.email} />
      <DashboardClient ownerId={session.id} />
    </div>
  )
}
