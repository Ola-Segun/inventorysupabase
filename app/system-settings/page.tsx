import { PageHeader } from "@/components/page-header"
import { SystemSettings } from "@/components/system-settings"

export default function SystemSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="System Settings" description="Configure global system settings and preferences." />
      <SystemSettings />
    </div>
  )
}

