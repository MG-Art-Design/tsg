import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Lock } from '@phosphor-icons/react'
import { SubscriptionTier } from '@/lib/types'

interface PremiumFeatureGateProps {
  userTier: SubscriptionTier
  featureName: string
  featureDescription: string
  children: ReactNode
  onUpgradeClick: () => void
}

export function PremiumFeatureGate({
  userTier,
  featureName,
  featureDescription,
  children,
  onUpgradeClick
}: PremiumFeatureGateProps) {
  if (userTier === 'premium') {
    return <>{children}</>
  }

  return (
    <Card className="border-2 border-[var(--insider-gold)]/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--insider-bg)]/60 to-transparent backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center p-6 space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-[var(--insider-bg)] rounded-full border-2 border-[var(--insider-gold)]">
              <Crown size={32} weight="fill" className="text-[var(--insider-gold)]" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--insider-gold)] mb-2">Premium Feature</h3>
            <p className="text-sm text-foreground/80 max-w-sm">
              {featureDescription}
            </p>
          </div>
          <Button
            onClick={onUpgradeClick}
            size="lg"
            className="bg-[var(--insider-gold)] text-[var(--insider-bg)] hover:bg-[var(--insider-gold-glow)] font-semibold shadow-lg"
          >
            <Crown size={20} weight="fill" className="mr-2" />
            Upgrade to Access
          </Button>
        </div>
      </div>
      <div className="blur-sm pointer-events-none select-none opacity-40">
        {children}
      </div>
    </Card>
  )
}

interface InlineFeatureGateProps {
  userTier: SubscriptionTier
  onUpgradeClick: () => void
}

export function InlineFeatureGate({ userTier, onUpgradeClick }: InlineFeatureGateProps) {
  if (userTier === 'premium') {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 bg-[var(--insider-bg)] border-2 border-[var(--insider-gold)]/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Lock size={24} className="text-[var(--insider-gold)]" weight="fill" />
        <div>
          <p className="text-sm font-semibold text-[var(--insider-gold)]">Premium Feature</p>
          <p className="text-xs text-foreground/70">Upgrade to unlock this feature</p>
        </div>
      </div>
      <Button
        onClick={onUpgradeClick}
        size="sm"
        className="bg-[var(--insider-gold)] text-[var(--insider-bg)] hover:bg-[var(--insider-gold-glow)]"
      >
        <Crown size={16} weight="fill" className="mr-1" />
        Upgrade
      </Button>
    </div>
  )
}
