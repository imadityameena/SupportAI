import AppHeader from '@/components/AppHeader'
import { EmbedSkeleton } from '@/components/PageSkeletons'

// Shown instantly when navigating to the install page, while the server checks the session.
export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <EmbedSkeleton />
    </div>
  )
}
