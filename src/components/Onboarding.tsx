import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { UserProfile } from '@/lib/types'
import { getRandomAvatar } from '@/lib/helpers'
import { Lightning } from '@phosphor-icons/react'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

const AVATAR_OPTIONS = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓', '🦍', '🐆', '🐅']

export function Onboarding({ onComplete }: OnboardingProps) {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(getRandomAvatar())
  const [bio, setBio] = useState('')
  const [insightFrequency, setInsightFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const handleSubmit = () => {
    if (!username.trim()) return

    const profile: UserProfile = {
      id: Date.now().toString(),
      username: username.trim(),
      avatar,
      bio: bio.trim(),
      insightFrequency,
      createdAt: Date.now(),
      groupIds: [],
    }

    onComplete(profile)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-lg border-primary/20 shadow-lg glow">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
              <Lightning size={32} weight="fill" className="text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to TSG
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

          <Button
            onClick={handleSubmit}
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg h-12 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            Start Trading
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
