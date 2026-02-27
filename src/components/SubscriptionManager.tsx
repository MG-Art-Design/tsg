import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { UserProfile, PaymentMethod } from '@/lib/types'
import { getSubscriptionFeatures, getSubscriptionDaysRemaining, isSubscriptionActive, SUBSCRIPTION_PRICING, calculateSubscriptionEndDate } from '@/lib/helpers'
import { Crown, Check, Sparkle, TrendUp, Users, Envelope, ChartBar, HeadCircuit } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SubscriptionManagerProps {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export function SubscriptionManager({ profile, onUpdate }: SubscriptionManagerProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [paymentType, setPaymentType] = useState<'card' | 'paypal' | 'crypto'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [processing, setProcessing] = useState(false)

  const currentFeatures = getSubscriptionFeatures(profile.subscription.tier)
  const premiumFeatures = getSubscriptionFeatures('premium')
  const isActive = profile.subscription.endDate ? isSubscriptionActive(profile.subscription.endDate) : false
  const daysRemaining = profile.subscription.endDate ? getSubscriptionDaysRemaining(profile.subscription.endDate) : 0

  const handleUpgrade = () => {
    setProcessing(true)

    setTimeout(() => {
      const months = billingCycle === 'annual' ? 12 : 1

      const payment: PaymentMethod = {
        type: paymentType,
        ...(paymentType === 'card' && {
          last4: cardNumber.slice(-4),
          expiryMonth: parseInt(expiryMonth),
          expiryYear: parseInt(expiryYear),
          brand: 'Visa'
        })
      }

      const updatedProfile: UserProfile = {
        ...profile,
        subscription: {
          tier: 'premium',
          startDate: Date.now(),
          endDate: calculateSubscriptionEndDate(months),
          autoRenew: true,
          paymentMethod: payment
        }
      }

      onUpdate(updatedProfile)
      setProcessing(false)
      setShowUpgradeDialog(false)

      toast.success('Welcome to Premium! 🎉', {
        description: `You now have access to all premium features. Your subscription ${billingCycle === 'annual' ? 'renews in 1 year' : 'renews monthly'}.`
      })
    }, 1500)
  }

  const handleCancel = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      subscription: {
        ...profile.subscription,
        autoRenew: false
      }
    }

    onUpdate(updatedProfile)
    setShowCancelDialog(false)

    toast.success('Subscription updated', {
      description: 'Your subscription will not renew. You can continue using premium features until the end of your billing period.'
    })
  }

  const handleReactivate = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      subscription: {
        ...profile.subscription,
        autoRenew: true
      }
    }

    onUpdate(updatedProfile)

    toast.success('Subscription reactivated! 🎉', {
      description: 'Your premium subscription will automatically renew.'
    })
  }

  const price = SUBSCRIPTION_PRICING.premium[billingCycle]
  const savings = billingCycle === 'annual' ? ((SUBSCRIPTION_PRICING.premium.monthly * 12) - SUBSCRIPTION_PRICING.premium.annual).toFixed(2) : null

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {profile.subscription.tier === 'premium' ? (
                  <>
                    <Crown size={24} weight="fill" className="text-[var(--insider-gold)]" />
                    Premium Subscription
                  </>
                ) : (
                  <>
                    Subscription Plan
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {profile.subscription.tier === 'premium' 
                  ? 'Unlock the full power of TSG with advanced insights and features'
                  : 'Upgrade to premium for advanced trading intelligence'
                }
              </CardDescription>
            </div>
            <Badge variant={profile.subscription.tier === 'premium' ? 'default' : 'secondary'} className="text-sm">
              {profile.subscription.tier === 'premium' ? 'Premium' : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.subscription.tier === 'premium' && isActive && (
            <div className="p-4 bg-[var(--insider-bg)] border border-[var(--insider-gold)]/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[var(--insider-gold)]">Active Subscription</p>
                {!profile.subscription.autoRenew && (
                  <Badge variant="outline" className="text-xs border-destructive text-destructive">
                    Expires Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground/80 mb-3">
                {profile.subscription.autoRenew 
                  ? `Renews automatically in ${daysRemaining} days`
                  : `Access until ${new Date(profile.subscription.endDate!).toLocaleDateString()}`
                }
              </p>
              {profile.subscription.paymentMethod && profile.subscription.paymentMethod.type === 'card' && (
                <p className="text-xs text-muted-foreground">
                  {profile.subscription.paymentMethod.brand} ending in {profile.subscription.paymentMethod.last4}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                {profile.subscription.autoRenew ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Auto-Renew
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleReactivate}
                    className="bg-[var(--insider-gold)] text-[var(--insider-bg)] hover:bg-[var(--insider-gold-glow)]"
                  >
                    Reactivate Subscription
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {profile.subscription.tier === 'premium' ? 'Your Premium Features' : 'Compare Plans'}
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Free</h4>
                  <p className="text-2xl font-bold">$0</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 text-muted-foreground" />
                    <span>Basic portfolio tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 text-muted-foreground" />
                    <span>Quarterly competitions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 text-muted-foreground" />
                    <span>Leaderboard access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 text-muted-foreground" />
                    <span>1 group maximum</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 p-4 border-2 border-[var(--insider-gold)]/40 rounded-lg bg-gradient-to-br from-[var(--insider-bg)] to-card relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Crown size={20} weight="fill" className="text-[var(--insider-gold)]" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[var(--insider-gold)]">Premium</h4>
                  <p className="text-2xl font-bold text-[var(--insider-gold)]">$9.99<span className="text-sm font-normal">/mo</span></p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <HeadCircuit size={16} className="mt-0.5 text-[var(--insider-gold)]" weight="fill" />
                    <span><strong>Strategic Insights AI</strong> - Insider trade analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users size={16} className="mt-0.5 text-[var(--insider-gold)]" weight="fill" />
                    <span><strong>Group Chat</strong> - Real-time messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Envelope size={16} className="mt-0.5 text-[var(--insider-gold)]" />
                    <span><strong>Email Notifications</strong> - Daily/weekly updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendUp size={16} className="mt-0.5 text-[var(--insider-gold)]" />
                    <span><strong>Unlimited Groups</strong> - Join as many as you want</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChartBar size={16} className="mt-0.5 text-[var(--insider-gold)]" />
                    <span><strong>Historical Data</strong> - Track past quarters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkle size={16} className="mt-0.5 text-[var(--insider-gold)]" weight="fill" />
                    <span><strong>Advanced Analytics</strong> - Deep portfolio insights</span>
                  </li>
                </ul>
                {profile.subscription.tier !== 'premium' && (
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    className="w-full mt-4 bg-[var(--insider-gold)] text-[var(--insider-bg)] hover:bg-[var(--insider-gold-glow)] font-semibold"
                  >
                    <Crown size={18} weight="fill" className="mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown size={24} weight="fill" className="text-[var(--insider-gold)]" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Get access to all premium features and take your trading game to the next level
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <RadioGroup value={billingCycle} onValueChange={(v) => setBillingCycle(v as typeof billingCycle)}>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    <span className="font-medium">Monthly</span>
                    <p className="text-sm text-muted-foreground">$9.99/month</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border-2 border-[var(--insider-gold)]/40 rounded-lg bg-[var(--insider-bg)]">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Annual</span>
                      <Badge variant="outline" className="text-xs border-[var(--insider-gold)] text-[var(--insider-gold)]">
                        Save ${savings}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">$99/year (2 months free)</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as typeof paymentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === 'card' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-month">Expiry Month</Label>
                    <Input
                      id="expiry-month"
                      placeholder="MM"
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value.slice(0, 2))}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry-year">Expiry Year</Label>
                    <Input
                      id="expiry-year"
                      placeholder="YY"
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value.slice(0, 2))}
                      maxLength={2}
                    />
                  </div>
                </div>
              </>
            )}

            {paymentType === 'paypal' && (
              <div className="p-4 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to PayPal to complete your purchase
                </p>
              </div>
            )}

            {paymentType === 'crypto' && (
              <div className="p-4 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to complete payment with cryptocurrency
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>${price}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-[var(--insider-gold)]">${price}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={processing || (paymentType === 'card' && (!cardNumber || !expiryMonth || !expiryYear))}
              className="bg-[var(--insider-gold)] text-[var(--insider-bg)] hover:bg-[var(--insider-gold-glow)]"
            >
              {processing ? 'Processing...' : `Subscribe - $${price}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Auto-Renewal?</DialogTitle>
            <DialogDescription>
              Your premium features will remain active until {profile.subscription.endDate ? new Date(profile.subscription.endDate).toLocaleDateString() : 'the end of your billing period'}.
              You can reactivate anytime before then.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Auto-Renew
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
