import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { UserProfile } from '@/lib/types'
import { getRandomAvatar } from '@/lib/helpers'
import { Logo } from '@/components/Logo'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

const AVATAR_OPTIONS = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓', '🦍', '🐆', '🐅']

export function Onboarding({ onComplete }: OnboardingProps) {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(getRandomAvatar())
  const [bio, setBio] = useState('')
  const [insightFrequency, setInsightFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [email, setEmail] = useState('')
  const [emailFrequency, setEmailFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [includeLeaderboard, setIncludeLeaderboard] = useState(true)
  const [includeMarketPerformance, setIncludeMarketPerformance] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)

  const handleSubmit = () => {
    if (!username.trim()) return
    if (emailEnabled && !email.trim()) return

    const userId = Date.now().toString()
    const profile: UserProfile = {
      id: userId,
      username: username.trim(),
      avatar,
      bio: bio.trim(),
      insightFrequency,
      emailNotifications: {
        enabled: emailEnabled,
        email: email.trim(),
        frequency: emailFrequency,
        includeLeaderboard,
        includeMarketPerformance,
        includeInsights,
      },
      createdAt: Date.now(),
      groupIds: [],
      subscription: {
        tier: 'free',
        autoRenew: false
      },
      friendIds: [],
      friendCode: `TSG-${userId.slice(-8)}`
    }

    onComplete(profile)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-lg border-primary/20 shadow-lg glow">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <Logo size="md" animated={true} />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to The Stonk Game
          </CardTitle>
          <CardDescription className="text-base">
            Join the most competitive trading club. Time to show your friends who's got the best market instincts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your trading name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Choose Your Avatar</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                    avatar === emoji
                      ? 'border-primary bg-primary/10 glow scale-110'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell your competitors what you're about..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary resize-none"
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium">
              Market Insights Frequency
            </Label>
            <Select value={insightFrequency} onValueChange={(v) => setInsightFrequency(v as typeof insightFrequency)}>
              <SelectTrigger id="frequency" className="bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily - Keep me in the loop</SelectItem>
                <SelectItem value="weekly">Weekly - Just the highlights</SelectItem>
                <SelectItem value="monthly">Monthly - Big picture only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">Get performance updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            {emailEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
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
                  <Select value={emailFrequency} onValueChange={(v) => setEmailFrequency(v as typeof emailFrequency)}>
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
                        id="include-leaderboard"
                        checked={includeLeaderboard}
                        onCheckedChange={(checked) => setIncludeLeaderboard(checked === true)}
                      />
                      <label
                        htmlFor="include-leaderboard"
                        className="text-sm text-foreground cursor-pointer"
                      >
                        Leaderboard rankings
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-market"
                        checked={includeMarketPerformance}
                        onCheckedChange={(checked) => setIncludeMarketPerformance(checked === true)}
                      />
                      <label
                        htmlFor="include-market"
                        className="text-sm text-foreground cursor-pointer"
                      >
                        Market performance
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-insights"
                        checked={includeInsights}
                        onCheckedChange={(checked) => setIncludeInsights(checked === true)}
                      />
                      <label
                        htmlFor="include-insights"
                        className="text-sm text-foreground cursor-pointer"
                      >
                        AI-generated insights
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!username.trim() || (emailEnabled && !email.trim())}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            Start Trading
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
