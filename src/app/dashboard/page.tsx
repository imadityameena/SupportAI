import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.id) {
    redirect("/")
  }

  return <DashboardClient />
}
