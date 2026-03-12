import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/types'
import { getEmailBasedAvatar } from '@/lib/helpers'
import { Logo } from '@/components/Logo'
import { Sparkle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
  initialEmail?: string
  initialUserId?: string
  initialFriendCode?: string
}

const AVATAR_OPTIONS = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓', '🦍', '🐆', '🐅', '🐧', '🦣', '🐬', '🐼', '🦘', '🐨', '🦉', '🐏', '🐂', '🦬', '🦄', '🐍']

function getAvatarMessage(email: string): string {
  if (!email) return "We picked this one randomly. You're a mystery!"
  
  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanEmail.length < 2) return "Your email's too cryptic. We improvised!"
  
  const firstChar = cleanEmail[0]
  const lastChar = cleanEmail[cleanEmail.length - 1]
  const combo = firstChar + lastChar
  
  const messages: Record<string, string> = {
    gs: "G and S? Obviously Grand Safari vibes! 🦁",
    td: "T and D equals Tidal Dive energy! 🐬",
    aa: "Double A? Arctic Adventure material! 🐧",
    zz: "Z to Z! You're the beginning AND the end! 🦓"
  }
  
  if (messages[combo]) return messages[combo]
  
  return `Your email gave us '${combo.toUpperCase()}' vibes - we translated that into this beauty!`
}

export function Onboarding({ onComplete, initialEmail, initialUserId, initialFriendCode }: OnboardingProps) {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(() => {
    return initialEmail ? getEmailBasedAvatar(initialEmail) : getEmailBasedAvatar('')
  })
  const [showAvatarMessage, setShowAvatarMessage] = useState(true)
  const [avatarMessage] = useState(() => getAvatarMessage(initialEmail || ''))
  
  useEffect(() => {
    if (initialEmail) {
      setAvatar(getEmailBasedAvatar(initialEmail))
    }
  }, [initialEmail])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAvatarMessage(false)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])
  
  const [bio, setBio] = useState('')
  const [insightFrequency, setInsightFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [emailEnabled, setEmailEnabled] = useState(!!initialEmail)
  const [email, setEmail] = useState(initialEmail || '')
  const [emailFrequency, setEmailFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [includeLeaderboard, setIncludeLeaderboard] = useState(true)
  const [includeMarketPerformance, setIncludeMarketPerformance] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)

  const handleSubmit = () => {
    if (!username.trim()) return
    if (emailEnabled && !email.trim()) return

    const userId = initialUserId || Date.now().toString()
    const profile: UserProfile = {
      id: userId,
      email: email.trim(),
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
      friendCode: initialFriendCode || `TSG-${userId.slice(-8)}`,
      relationshipStatuses: {},
      notificationPreferences: {
        relationshipChanges: true,
        friendPortfolioUpdates: true,
        leaderboardChanges: true,
        groupActivity: true,
        groupGameInvites: true
      }
    }

    onComplete(profile)
  }

  return (
    <div className="min-h-screen bg-[oklch(0.05_0.008_70)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-pool-container fixed inset-0 pointer-events-none">
        <div className="auth-pool-ripple auth-pool-ripple-1" />
        <div className="auth-pool-ripple auth-pool-ripple-2" />
        <div className="auth-pool-ripple auth-pool-ripple-3" />
        <div className="auth-pool-ripple auth-pool-ripple-4" />
      </div>

      <Card className="w-full max-w-lg border-2 border-[oklch(0.70_0.14_75)] bg-[oklch(0.03_0.006_70)] shadow-[0_0_40px_oklch(0.65_0.12_75_/_0.25),0_0_80px_oklch(0.65_0.12_75_/_0.15)] backdrop-blur-sm relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.70_0.14_75_/_0.05)] via-transparent to-[oklch(0.70_0.14_75_/_0.03)] pointer-events-none" />
        <CardHeader className="text-center space-y-2 relative z-10">
          <div className="flex justify-center mb-6">
            <Logo size="md" animated={true} />
          </div>
          <CardTitle className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">
            Welcome to The Stonk Game
          </CardTitle>
          <CardDescription className="text-base text-[oklch(0.58_0.02_240)]">
            Join the most competitive trading club. Time to show your friends who's got the best market instincts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-[oklch(0.70_0.14_75)]">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your trading name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[oklch(0.70_0.14_75)]">Choose Your Avatar</Label>
            
            <AnimatePresence>
              {showAvatarMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-2 border-[oklch(0.70_0.14_75_/_0.5)] bg-gradient-to-r from-[oklch(0.08_0.006_70)] to-[oklch(0.10_0.005_60)] shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
                    <Sparkle size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                    <AlertDescription className="text-[oklch(0.70_0.14_75)] font-medium">
                      {avatarMessage}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setAvatar(emoji)
                    setShowAvatarMessage(false)
                  }}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                    avatar === emoji
                      ? 'border-[oklch(0.70_0.14_75)] bg-[oklch(0.70_0.14_75_/_0.15)] shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.4)] scale-110'
                      : 'border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] hover:border-[oklch(0.70_0.14_75_/_0.6)]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-[oklch(0.70_0.14_75)]">
              Bio <span className="text-[oklch(0.58_0.02_240)]">(Optional)</span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell your competitors what you're about..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300 resize-none"
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-[oklch(0.58_0.02_240)] text-right">{bio.length}/150</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium text-[oklch(0.70_0.14_75)]">
              Market Insights Frequency
            </Label>
            <Select value={insightFrequency} onValueChange={(v) => setInsightFrequency(v as typeof insightFrequency)}>
              <SelectTrigger id="frequency" className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily - Keep me in the loop</SelectItem>
                <SelectItem value="weekly">Weekly - Just the highlights</SelectItem>
                <SelectItem value="monthly">Monthly - Big picture only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t border-[oklch(0.28_0.02_240)]">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium text-[oklch(0.70_0.14_75)]">
                  Email Notifications
                </Label>
                <p className="text-xs text-[oklch(0.58_0.02_240)]">Get performance updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            {emailEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-[oklch(0.70_0.14_75_/_0.3)]">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[oklch(0.70_0.14_75)]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-frequency" className="text-sm font-medium text-[oklch(0.70_0.14_75)]">
                    Email Frequency
                  </Label>
                  <Select value={emailFrequency} onValueChange={(v) => setEmailFrequency(v as typeof emailFrequency)}>
                    <SelectTrigger id="email-frequency" className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300">
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
                  <Label className="text-sm font-medium text-[oklch(0.70_0.14_75)]">Include in Email</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-leaderboard"
                        checked={includeLeaderboard}
                        onCheckedChange={(checked) => setIncludeLeaderboard(checked === true)}
                        className="border-[oklch(0.70_0.14_75_/_0.5)] data-[state=checked]:bg-[oklch(0.70_0.14_75)] data-[state=checked]:border-[oklch(0.70_0.14_75)]"
                      />
                      <label
                        htmlFor="include-leaderboard"
                        className="text-sm text-[oklch(0.92_0.01_240)] cursor-pointer"
                      >
                        Leaderboard rankings
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-market"
                        checked={includeMarketPerformance}
                        onCheckedChange={(checked) => setIncludeMarketPerformance(checked === true)}
                        className="border-[oklch(0.70_0.14_75_/_0.5)] data-[state=checked]:bg-[oklch(0.70_0.14_75)] data-[state=checked]:border-[oklch(0.70_0.14_75)]"
                      />
                      <label
                        htmlFor="include-market"
                        className="text-sm text-[oklch(0.92_0.01_240)] cursor-pointer"
                      >
                        Market performance
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-insights"
                        checked={includeInsights}
                        onCheckedChange={(checked) => setIncludeInsights(checked === true)}
                        className="border-[oklch(0.70_0.14_75_/_0.5)] data-[state=checked]:bg-[oklch(0.70_0.14_75)] data-[state=checked]:border-[oklch(0.70_0.14_75)]"
                      />
                      <label
                        htmlFor="include-insights"
                        className="text-sm text-[oklch(0.92_0.01_240)] cursor-pointer"
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
            className="w-full bg-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.75_0.16_75)] text-[oklch(0.05_0.008_70)] font-bold shadow-[0_0_30px_oklch(0.65_0.12_75_/_0.4)] hover:shadow-[0_0_40px_oklch(0.65_0.12_75_/_0.6)] transition-all duration-300 border-2 border-[oklch(0.70_0.14_75)] text-lg h-12"
          >
            Start Trading
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
