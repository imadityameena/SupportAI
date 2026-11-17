import AppHeader from '@/components/AppHeader'
import { DashboardSkeleton } from '@/components/PageSkeletons'

// Shown instantly when navigating to the dashboard, while the server checks the session.
export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <DashboardSkeleton />
    </div>
  )
}
