import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserProfile } from '@/lib/types'
import { Crown, Sparkle, TrendUp, Users, Envelope, ChartBar, HeadCircuit } from '@phosphor-icons/react'

interface SubscriptionManagerProps {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export function SubscriptionManager({ profile, onUpdate }: SubscriptionManagerProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown size={24} weight="fill" className="text-[var(--insider-gold)]" />
              TSG Membership
            </CardTitle>
            <CardDescription>
              All features are available to everyone. Welcome to The Stonk Game!
            </CardDescription>
          </div>
          <Badge variant="default" className="text-sm bg-[var(--insider-gold)] text-[var(--insider-bg)]">
            TSG Exclusive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-[var(--insider-bg)] border border-[var(--insider-gold)]/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--insider-gold)]">All Features Unlocked</p>
          </div>
          <p className="text-sm text-foreground/80">
            Every feature is available to all users free of charge. Enjoy the full TSG experience!
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--insider-gold)]">What's Included:</h3>

          <div className="space-y-3 p-4 border-2 border-[var(--insider-gold)]/40 rounded-lg bg-gradient-to-br from-[var(--insider-bg)] to-card relative overflow-hidden gold-shimmer-slow">
            <div className="absolute top-2 right-2">
              <Crown size={20} weight="fill" className="text-[var(--insider-gold)]" />
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <HeadCircuit size={18} className="mt-0.5 text-[var(--insider-gold)]" weight="fill" />
                <span><strong className="text-[var(--insider-gold)]">Strategic Insights AI</strong> - Insider trade analysis powered by AI</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkle size={18} className="mt-0.5 text-[var(--insider-gold)]" weight="fill" />
                <span><strong className="text-[var(--insider-gold)]">Stonk: OMG It's In</strong> - Real-time insider trading intelligence</span>
              </li>
              <li className="flex items-start gap-2">
                <Users size={18} className="mt-0.5 text-[var(--insider-gold)]" weight="fill" />
                <span><strong className="text-[var(--insider-gold)]">Unlimited Groups</strong> - Join as many groups as you want</span>
              </li>
              <li className="flex items-start gap-2">
                <Envelope size={18} className="mt-0.5 text-[var(--insider-gold)]" />
                <span><strong className="text-[var(--insider-gold)]">Email Notifications</strong> - Daily/weekly market updates</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendUp size={18} className="mt-0.5 text-[var(--insider-gold)]" />
                <span><strong className="text-[var(--insider-gold)]">Multi-Portfolio Manager</strong> - Track multiple portfolios</span>
              </li>
              <li className="flex items-start gap-2">
                <ChartBar size={18} className="mt-0.5 text-[var(--insider-gold)]" />
                <span><strong className="text-[var(--insider-gold)]">Advanced Analytics</strong> - Deep portfolio insights</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
