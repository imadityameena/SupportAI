import type { Metadata } from 'next'
import AppHeader from '@/components/AppHeader'
import DashboardClient, { type SettingsFields } from '@/components/DashboardClient'
import connectDb from '@/lib/db'
import { getSession } from '@/lib/getSession'
import Settings from '@/model/settings.model'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: "Bot settings" }

// Load settings with the page so the browser doesn't need a second round trip.
async function loadSettings(ownerId: string): Promise<SettingsFields | null> {
  try {
    await connectDb()
    const s = await Settings.findOne({ ownerId }).lean()
    return {
      businessName: s?.businessName ?? "",
      supportEmail: s?.supportEmail ?? "",
      knowledge: s?.knowledge ?? "",
    }
  } catch (error) {
    console.error("[dashboard] settings load failed", error)
    return null // the client will retry and show a skeleton meanwhile
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.id) {
    redirect("/")
  }
  const initialSettings = await loadSettings(session.id)

  return (
    <div className="min-h-screen">
      <AppHeader email={session.email} />
      <DashboardClient ownerId={session.id} initialSettings={initialSettings} />
    </div>
  )
}
