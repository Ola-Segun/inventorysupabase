import { UserSettings } from "@/components/user-settings"
import { PageHeader } from "@/components/page-header"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences." />
      <UserSettings />
    </div>
  )
}

