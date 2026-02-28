import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { PayoutNotification, UserProfile } from '@/lib/types'
import { Trophy, X, QrCode } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface BettingPayoutNotifierProps {
  currentUser: UserProfile
}

export function BettingPayoutNotifier({ currentUser }: BettingPayoutNotifierProps) {
  const [payoutNotifications, setPayoutNotifications] = useKV<PayoutNotification[]>('payout-notifications', [])
  const [dismissedNotifications, setDismissedNotifications] = useKV<string[]>(
    `dismissed-payouts-${currentUser.id}`,
    []
  )
  const [selectedNotification, setSelectedNotification] = useState<PayoutNotification | null>(null)

  const activeNotifications = (payoutNotifications || []).filter(
    (n) => 
      !dismissedNotifications?.includes(n.id) &&
      n.memberPayments.some((p) => p.userId === currentUser.id && p.paymentStatus === 'pending')
  )

  const handleDismiss = (notificationId: string) => {
    setDismissedNotifications((current) => [...(current || []), notificationId])
  }

  const handleAcknowledge = (notificationId: string) => {
    setPayoutNotifications((current) =>
      (current || []).map((n) =>
        n.id === notificationId
          ? {
              ...n,
              memberPayments: n.memberPayments.map((p) =>
                p.userId === currentUser.id
                  ? { ...p, paymentStatus: 'acknowledged' as const }
                  : p
              ),
            }
          : n
      )
    )
    handleDismiss(notificationId)
    toast.success('Payment acknowledged!')
  }

  const handleViewDetails = (notification: PayoutNotification) => {
    setSelectedNotification(notification)
  }

  return (
    <>
      <AnimatePresence>
        {activeNotifications.map((notification) => {
          const payment = notification.memberPayments.find((p) => p.userId === currentUser.id)
          if (!payment) return null

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[calc(100vw-2rem)]"
            >
              <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.08_0.006_70)] shadow-[0_0_30px_oklch(0.65_0.12_75_/_0.4)]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy size={24} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                      <div>
                        <h3 className="font-bold text-sm">Payment Due</h3>
                        <p className="text-xs text-muted-foreground">{notification.groupName}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismiss(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                      <div className="text-3xl">{notification.winnerAvatar}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{notification.winnerUsername}</p>
                        <Badge variant="secondary" className="text-xs">
                          {notification.periodType} Winner
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center p-3 border-2 border-[oklch(0.70_0.14_75)] rounded-lg bg-[oklch(0.65_0.12_75_/_0.1)]">
                      <p className="text-xs text-muted-foreground mb-1">You Owe</p>
                      <p className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">
                        ${payment.amountOwed}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(notification)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledge(notification.id)}
                        className="flex-1 bg-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75)]"
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedNotification.winnerAvatar}</div>
                <h3 className="text-xl font-bold">{selectedNotification.winnerUsername}</h3>
                <Badge className="mt-2">{selectedNotification.periodType} Winner</Badge>
                <p className="text-sm text-muted-foreground mt-2">{selectedNotification.groupName}</p>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
                <p className="text-3xl font-bold text-[oklch(0.70_0.14_75)]">
                  ${selectedNotification.memberPayments.find((p) => p.userId === currentUser.id)?.amountOwed || 0}
                </p>
              </div>

              {selectedNotification.winnerPaymentAccounts && selectedNotification.winnerPaymentAccounts.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Payment Methods</h4>
                    {selectedNotification.winnerPaymentAccounts.map((account, idx) => (
                      <Card key={idx} className="bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary">
                              {account.type === 'venmo' ? 'Venmo' : 'Zelle'}
                            </Badge>
                            {account.qrCodeDataUrl && (
                              <Badge variant="outline" className="gap-1">
                                <QrCode size={12} />
                                QR Code
                              </Badge>
                            )}
                          </div>
                          {account.accountIdentifier && (
                            <p className="text-sm font-mono mb-3 break-all">{account.accountIdentifier}</p>
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
                  handleAcknowledge(selectedNotification.id)
                  setSelectedNotification(null)
                }}
                className="w-full bg-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75)]"
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
