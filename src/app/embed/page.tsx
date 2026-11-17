import EmbedClient from '@/components/EmbedClient'
import { getSession } from '@/lib/getSession'
import { redirect } from 'next/navigation'

export default async function EmbedPage() {
  const session = await getSession()
  const ownerId = session?.id
  if (!ownerId) {
    redirect("/")
  }

  return <EmbedClient ownerId={ownerId} />
}
