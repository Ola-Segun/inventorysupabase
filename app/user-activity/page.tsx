import { PageHeader } from "@/components/page-header"
import { UserActivityLog } from "@/components/user-activity-log"

export default function UserActivityPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader title="User Activity Log" description="Track and monitor all user actions in the system" />
      <UserActivityLog />
    </div>
  )
}
