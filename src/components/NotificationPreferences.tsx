import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UserProfile } from '@/lib/types'
import { Bell } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface NotificationPreferencesProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export function NotificationPreferences({ profile, onUpdate }: NotificationPreferencesProps) {
  const handleToggle = (key: keyof typeof profile.notificationPreferences) => {
    onUpdate({
      ...profile,
      notificationPreferences: {
        ...profile.notificationPreferences,
        [key]: !profile.notificationPreferences[key]
      }
    })
    toast.success('Notification preferences updated')
  }

  return (
    <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.08_0.006_70)] shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={24} weight="bold" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control which real-time notifications you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="relationship-changes">Relationship Changes</Label>
            <p className="text-sm text-muted-foreground">
              When friends are added or relationship statuses change
            </p>
          </div>
          <Switch
            id="relationship-changes"
            checked={profile.notificationPreferences.relationshipChanges}
            onCheckedChange={() => handleToggle('relationshipChanges')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="portfolio-updates">Friend Portfolio Updates</Label>
            <p className="text-sm text-muted-foreground">
              When friends' portfolios change significantly (±5%)
            </p>
          </div>
          <Switch
            id="portfolio-updates"
            checked={profile.notificationPreferences.friendPortfolioUpdates}
            onCheckedChange={() => handleToggle('friendPortfolioUpdates')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="leaderboard-changes">Leaderboard Changes</Label>
            <p className="text-sm text-muted-foreground">
              When friends move up in rankings
            </p>
          </div>
          <Switch
            id="leaderboard-changes"
            checked={profile.notificationPreferences.leaderboardChanges}
            onCheckedChange={() => handleToggle('leaderboardChanges')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="group-activity">Group Activity</Label>
            <p className="text-sm text-muted-foreground">
              New messages and activity in your groups
            </p>
          </div>
          <Switch
            id="group-activity"
            checked={profile.notificationPreferences.groupActivity}
            onCheckedChange={() => handleToggle('groupActivity')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="game-invites">Group Game Invites</Label>
            <p className="text-sm text-muted-foreground">
              When new group games are started
            </p>
          </div>
          <Switch
            id="game-invites"
            checked={profile.notificationPreferences.groupGameInvites}
            onCheckedChange={() => handleToggle('groupGameInvites')}
          />
        </div>
      </CardContent>
    </Card>
  )
}
