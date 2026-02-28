import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Group, UserProfile, BettingSettings, PayoutNotification } from '@/lib/types'
import { calculateTieredPayouts } from '@/lib/bettingHelpers'
import { CurrencyDollar, Trophy, Bell, CheckCircle, ArrowsClockwise, Medal } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GroupBettingManagerProps {
  group: Group
  currentUser: UserProfile
  isAdmin: boolean
  onGroupUpdate: (updatedGroup: Group) => void
}

export function GroupBettingManager({ group, currentUser, isAdmin, onGroupUpdate }: GroupBettingManagerProps) {
  useKV<Record<string, UserProfile>>('all-users', {})
  const [payoutNotifications, setPayoutNotifications] = useKV<PayoutNotification[]>('payout-notifications', [])
  
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [viewPayoutDialogOpen, setViewPayoutDialogOpen] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<PayoutNotification | null>(null)
  
  const [bettingEnabled, setBettingEnabled] = useState<boolean>(group.bettingSettings?.enabled || false)
  const [entryFee, setEntryFee] = useState<number>(group.bettingSettings?.entryFee || 10)
  const [payoutStructure, setPayoutStructure] = useState<'winner-take-all' | 'top-3' | 'top-5'>(
    group.bettingSettings?.payoutStructure || 'winner-take-all'
  )
  const [weeklyEnabled, setWeeklyEnabled] = useState<boolean>(group.bettingSettings?.weeklyEnabled || false)
  const [monthlyEnabled, setMonthlyEnabled] = useState<boolean>(group.bettingSettings?.monthlyEnabled || true)
  const [seasonEnabled, setSeasonEnabled] = useState<boolean>(group.bettingSettings?.seasonEnabled || true)

  const bettingSettings = group.bettingSettings
  const bettingPeriods = group.bettingPeriods || []
  const completedPeriods = bettingPeriods.filter(p => Date.now() >= p.endDate)

  const groupNotifications = (payoutNotifications || []).filter(n => n.groupId === group.id)
  const userPayments = groupNotifications.flatMap(n => 
    n.memberPayments.filter(p => p.userId === currentUser.id)
  )

  const handleSaveSettings = () => {
    const settings: BettingSettings = {
      enabled: bettingEnabled,
      entryFee,
      payoutStructure,
      weeklyEnabled,
      monthlyEnabled,
      seasonEnabled,
      weeklyPayout: weeklyEnabled ? entryFee * group.memberIds.length : undefined,
      monthlyPayout: monthlyEnabled ? entryFee * group.memberIds.length : undefined,
      seasonPayout: seasonEnabled ? entryFee * group.memberIds.length : undefined
    }

    onGroupUpdate({
      ...group,
      bettingSettings: settings
    })

    toast.success('Betting settings updated!', {
      description: `Entry fee: $${entryFee} • ${payoutStructure.replace('-', ' ')}`
    })
    setSettingsDialogOpen(false)
  }

  const handleResetPayouts = () => {
    if (!isAdmin) return

    onGroupUpdate({
      ...group,
      bettingPeriods: []
    })

    const updatedNotifications = (payoutNotifications || []).filter(n => n.groupId !== group.id)
    setPayoutNotifications(updatedNotifications)

    toast.success('All payouts reset!', {
      description: 'Betting periods and payment history cleared'
    })
  }

  const handleAcknowledgePayment = (notificationId: string, userId: string) => {
    setPayoutNotifications((current) =>
      (current || []).map(n =>
        n.id === notificationId
          ? {
              ...n,
              memberPayments: n.memberPayments.map(p =>
                p.userId === userId ? { ...p, paymentStatus: 'acknowledged' as const } : p
              )
            }
          : n
      )
    )
    toast.success('Payment acknowledged! ✓')
  }

  const handleViewPayout = (notification: PayoutNotification) => {
    setSelectedPayout(notification)
    setViewPayoutDialogOpen(true)
  }

  if (!bettingSettings?.enabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollar size={24} weight="fill" />
                Group Betting
              </CardTitle>
              <CardDescription>Betting is not enabled for this group</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setSettingsDialogOpen(true)} size="sm">
                Enable Betting
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollar size={24} weight="fill" />
                Group Betting
              </CardTitle>
              <CardDescription>
                Entry: ${bettingSettings.entryFee} • {bettingSettings.payoutStructure.replace('-', ' ')}
              </CardDescription>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={handleResetPayouts} variant="outline" size="sm" className="gap-2">
                  <ArrowsClockwise size={16} />
                  Reset
                </Button>
                <Button onClick={() => setSettingsDialogOpen(true)} variant="outline" size="sm">
                  Settings
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {bettingSettings.weeklyEnabled && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Weekly</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">
                    ${bettingSettings.weeklyPayout || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bettingSettings.payoutStructure === 'winner-take-all' 
                      ? 'Winner takes all'
                      : bettingSettings.payoutStructure === 'top-3'
                      ? 'Split among top 3'
                      : 'Split among top 5'}
                  </p>
                </CardContent>
              </Card>
            )}
            {bettingSettings.monthlyEnabled && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Monthly</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">
                    ${bettingSettings.monthlyPayout || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bettingSettings.payoutStructure === 'winner-take-all' 
                      ? 'Winner takes all'
                      : bettingSettings.payoutStructure === 'top-3'
                      ? 'Split among top 3'
                      : 'Split among top 5'}
                  </p>
                </CardContent>
              </Card>
            )}
            {bettingSettings.seasonEnabled && (
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Season</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">
                    ${bettingSettings.seasonPayout || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bettingSettings.payoutStructure === 'winner-take-all' 
                      ? 'Winner takes all'
                      : bettingSettings.payoutStructure === 'top-3'
                      ? 'Split among top 3'
                      : 'Split among top 5'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {bettingSettings.payoutStructure !== 'winner-take-all' && (
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Medal size={18} weight="fill" />
                  Payout Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {calculateTieredPayouts(
                    bettingSettings.entryFee * group.memberIds.length,
                    bettingSettings.payoutStructure,
                    group.memberIds.length
                  ).map((tier) => (
                    <div key={tier.rank} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={tier.rank === 1 ? 'default' : 'secondary'}>
                          #{tier.rank}
                        </Badge>
                        <span className="text-muted-foreground">{tier.percentage}%</span>
                      </div>
                      <span className="font-semibold">${tier.payout.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {userPayments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Bell size={18} />
                  Your Payments Due
                </h3>
                <div className="space-y-2">
                  {userPayments.map((payment, idx) => {
                    const notification = groupNotifications.find(n =>
                      n.memberPayments.some(p => p.userId === payment.userId)
                    )
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{notification?.winnerAvatar}</div>
                          <div>
                            <p className="font-semibold">{notification?.winnerUsername}</p>
                            <p className="text-sm text-muted-foreground">
                              {notification?.periodType} winner • ${payment.amountOwed}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.paymentStatus === 'acknowledged' ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle size={14} weight="fill" />
                              Paid
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => notification && handleViewPayout(notification)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  notification && handleAcknowledgePayment(notification.id, currentUser.id)
                                }
                              >
                                Mark Paid
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {completedPeriods.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy size={18} weight="fill" />
                  Past Winners
                </h3>
                <div className="space-y-3">
                  {completedPeriods.slice(0, 5).map((period) => (
                    <Card key={period.id} className="border">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2 capitalize">
                                {period.type}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(period.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Total Pot</p>
                              <p className="text-lg font-bold text-[oklch(0.70_0.14_75)]">
                                ${period.totalPot}
                              </p>
                            </div>
                          </div>
                          
                          {period.winnerPayouts && period.winnerPayouts.length > 0 ? (
                            <div className="space-y-2">
                              {period.winnerPayouts.map((winner) => (
                                <div
                                  key={winner.userId}
                                  className="flex items-center justify-between p-2 bg-accent/5 rounded-lg border border-accent/20"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge variant={winner.rank === 1 ? 'default' : 'secondary'}>
                                      #{winner.rank}
                                    </Badge>
                                    <div className="text-2xl">{winner.avatar}</div>
                                    <div>
                                      <p className="font-semibold">{winner.username}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {winner.percentage}% of pot
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-success">
                                      ${winner.payout.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2 bg-accent/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{period.winnerAvatar}</div>
                                <div>
                                  <p className="font-semibold">{period.winnerUsername}</p>
                                  <p className="text-xs text-muted-foreground">Winner takes all</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-success">${period.payout.toFixed(2)}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {period.payoutStatus}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Betting Settings</DialogTitle>
            <DialogDescription>Configure betting rules for this group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Betting</Label>
                <p className="text-sm text-muted-foreground">Turn on/off betting for this group</p>
              </div>
              <Switch checked={bettingEnabled} onCheckedChange={setBettingEnabled} />
            </div>

            {bettingEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="entry-fee">Entry Fee ($)</Label>
                  <Input
                    id="entry-fee"
                    type="number"
                    min="1"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Total pot: ${entryFee * group.memberIds.length}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Payout Structure</Label>
                  <Select value={payoutStructure} onValueChange={(v) => setPayoutStructure(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="winner-take-all">Winner Take All (100%)</SelectItem>
                      <SelectItem value="top-3">Top 3 Split (60% / 25% / 15%)</SelectItem>
                      <SelectItem value="top-5">Top 5 Split (40% / 25% / 15% / 12% / 8%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {payoutStructure === 'winner-take-all' 
                      ? 'All winnings go to first place'
                      : payoutStructure === 'top-3'
                      ? 'Prize pool split among top 3 performers'
                      : 'Prize pool split among top 5 performers'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Payout Periods</Label>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Weekly</p>
                      <p className="text-xs text-muted-foreground">Payout every week</p>
                    </div>
                    <Switch checked={weeklyEnabled} onCheckedChange={(checked) => setWeeklyEnabled(checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Monthly</p>
                      <p className="text-xs text-muted-foreground">Payout every month</p>
                    </div>
                    <Switch checked={monthlyEnabled} onCheckedChange={(checked) => setMonthlyEnabled(checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Season</p>
                      <p className="text-xs text-muted-foreground">Payout at season end</p>
                    </div>
                    <Switch checked={seasonEnabled} onCheckedChange={(checked) => setSeasonEnabled(checked)} />
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSaveSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewPayoutDialogOpen} onOpenChange={setViewPayoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Send payment to {selectedPayout?.winnerUsername}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedPayout.winnerAvatar}</div>
                <h3 className="text-xl font-bold">{selectedPayout.winnerUsername}</h3>
                <Badge className="mt-2">{selectedPayout.periodType} Winner</Badge>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
                <p className="text-3xl font-bold text-[oklch(0.70_0.14_75)]">
                  ${selectedPayout.memberPayments.find(p => p.userId === currentUser.id)?.amountOwed || 0}
                </p>
              </div>

              {selectedPayout.winnerPaymentAccounts && selectedPayout.winnerPaymentAccounts.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Payment Methods</Label>
                    {selectedPayout.winnerPaymentAccounts.map((account, idx) => (
                      <Card key={idx} className="bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary">
                              {account.type === 'venmo' ? 'Venmo' : 'Zelle'}
                            </Badge>
                          </div>
                          {account.accountIdentifier && (
                            <p className="text-sm font-mono mb-3">{account.accountIdentifier}</p>
                          )}
                          {account.qrCodeDataUrl && (
                            <img
                              src={account.qrCodeDataUrl}
                              alt="Payment QR Code"
                              className="w-full max-w-[200px] mx-auto border-2 border-border rounded-lg"
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              <Button
                onClick={() => {
                  handleAcknowledgePayment(selectedPayout.id, currentUser.id)
                  setViewPayoutDialogOpen(false)
                }}
                className="w-full"
              >
                Mark as Paid
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
