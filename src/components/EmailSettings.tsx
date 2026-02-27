import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { UserProfile } from '@/lib/types'
import { Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EmailSettingsProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export function EmailSettings({ profile, onUpdate }: EmailSettingsProps) {
  const [enabled, setEnabled] = useState(profile.emailNotifications?.enabled ?? false)
  const [email, setEmail] = useState(profile.emailNotifications?.email ?? '')
  const [frequency, setFrequency] = useState(profile.emailNotifications?.frequency ?? 'weekly')
  const [includeLeaderboard, setIncludeLeaderboard] = useState(
    profile.emailNotifications?.includeLeaderboard ?? true
  )
  const [includeMarketPerformance, setIncludeMarketPerformance] = useState(
    profile.emailNotifications?.includeMarketPerformance ?? true
  )
  const [includeInsights, setIncludeInsights] = useState(
    profile.emailNotifications?.includeInsights ?? true
  )

  const handleSave = () => {
    if (enabled && !email.trim()) {
      toast.error('Email address is required when notifications are enabled')
      return
    }

    const updatedProfile: UserProfile = {
      ...profile,
      emailNotifications: {
        enabled,
        email: email.trim(),
        frequency,
        includeLeaderboard,
        includeMarketPerformance,
        includeInsights,
        lastSent: profile.emailNotifications?.lastSent,
      },
    }

    onUpdate(updatedProfile)

    toast.success('Email preferences updated', {
      description: enabled
        ? `You'll receive ${frequency} updates at ${email}`
        : 'Email notifications disabled',
    })
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Envelope size={24} className="text-primary" weight="fill" />
          </div>
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Get performance updates and insights delivered to your inbox
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-enabled" className="text-sm font-medium">
              Enable Email Notifications
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Receive regular updates about your portfolio
            </p>
          </div>
          <Switch
            id="email-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20">
            <div className="space-y-2">
              <Label htmlFor="email-address" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email-address"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-frequency" className="text-sm font-medium">
                Email Frequency
              </Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as typeof frequency)}
              >
                <SelectTrigger id="email-frequency" className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Updates</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Include in Email</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-leaderboard"
                    checked={includeLeaderboard}
                    onCheckedChange={(checked) => setIncludeLeaderboard(checked === true)}
                  />
                  <label
                    htmlFor="settings-leaderboard"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Leaderboard rankings
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-market"
                    checked={includeMarketPerformance}
                    onCheckedChange={(checked) =>
                      setIncludeMarketPerformance(checked === true)
                    }
                  />
                  <label
                    htmlFor="settings-market"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Market performance
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-insights"
                    checked={includeInsights}
                    onCheckedChange={(checked) => setIncludeInsights(checked === true)}
                  />
                  <label
                    htmlFor="settings-insights"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    AI-generated insights
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
