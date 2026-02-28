import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserProfile, PaymentAccount } from '@/lib/types'
import { CreditCard, Plus, Trash, QrCode, Camera, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { BiometricReauth } from '@/components/BiometricReauth'

interface PaymentAccountManagerProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export function PaymentAccountManager({ profile, onUpdate }: PaymentAccountManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [accountType, setAccountType] = useState<'venmo' | 'zelle'>('venmo')
  const [accountIdentifier, setAccountIdentifier] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>()
  const [showReauth, setShowReauth] = useState(false)
  const [reauthAction, setReauthAction] = useState<'add' | 'remove'>('add')
  const [pendingRemovalIndex, setPendingRemovalIndex] = useState<number | null>(null)

  const paymentAccounts = profile.paymentAccounts || []

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setQrCodeDataUrl(event.target?.result as string)
      toast.success('QR code uploaded!')
    }
    reader.readAsDataURL(file)
  }

  const handleAddAccount = () => {
    if (!accountIdentifier.trim() && !qrCodeDataUrl) {
      toast.error('Please provide at least an account identifier or QR code')
      return
    }

    setReauthAction('add')
    setShowReauth(true)
  }

  const executeAddAccount = () => {
    const newAccount: PaymentAccount = {
      type: accountType,
      accountIdentifier: accountIdentifier.trim() || undefined,
      qrCodeDataUrl: qrCodeDataUrl
    }

    const updatedAccounts = [...paymentAccounts, newAccount]

    onUpdate({
      ...profile,
      paymentAccounts: updatedAccounts
    })

    toast.success(`${accountType === 'venmo' ? 'Venmo' : 'Zelle'} account added!`, {
      description: 'Your payment info will be shown when you win group bets'
    })

    setAccountIdentifier('')
    setQrCodeDataUrl(undefined)
    setDialogOpen(false)
  }

  const handleRemoveAccount = (index: number) => {
    setPendingRemovalIndex(index)
    setReauthAction('remove')
    setShowReauth(true)
  }

  const executeRemoveAccount = () => {
    if (pendingRemovalIndex === null) return

    const updatedAccounts = paymentAccounts.filter((_, i) => i !== pendingRemovalIndex)
    onUpdate({
      ...profile,
      paymentAccounts: updatedAccounts
    })
    toast.success('Payment account removed')
    setPendingRemovalIndex(null)
  }

  const handleAuthenticated = () => {
    if (reauthAction === 'add') {
      executeAddAccount()
    } else if (reauthAction === 'remove') {
      executeRemoveAccount()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={24} />
              Payment Accounts
            </CardTitle>
            <CardDescription>
              Add Venmo or Zelle for group betting payouts
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} weight="bold" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Account</DialogTitle>
                <DialogDescription>
                  Add your Venmo or Zelle info for group betting payouts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={accountType} onValueChange={(v) => setAccountType(v as 'venmo' | 'zelle')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-id">
                    {accountType === 'venmo' ? 'Venmo Username' : 'Zelle Email/Phone'}
                  </Label>
                  <Input
                    id="account-id"
                    placeholder={accountType === 'venmo' ? '@username' : 'email@example.com'}
                    value={accountIdentifier}
                    onChange={(e) => setAccountIdentifier(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>QR Code (Optional)</Label>
                  <div className="space-y-2">
                    {qrCodeDataUrl ? (
                      <div className="relative">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-32 h-32 object-contain border-2 border-border rounded-lg mx-auto"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setQrCodeDataUrl(undefined)}
                          className="absolute top-1 right-1"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full gap-2"
                      >
                        <Camera size={18} />
                        Upload QR Code
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                  <ShieldCheck size={16} className="text-primary mt-0.5 flex-shrink-0" weight="fill" />
                  <p className="text-muted-foreground">
                    Adding payment accounts requires biometric or password verification
                  </p>
                </div>

                <Button onClick={handleAddAccount} className="w-full">
                  Add Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {paymentAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <QrCode size={48} className="mx-auto mb-2 opacity-50" />
            <p>No payment accounts added yet</p>
            <p className="text-sm mt-1">Add one to receive payouts from group bets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentAccounts.map((account, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {account.qrCodeDataUrl ? (
                      <QrCode size={20} className="text-primary" weight="fill" />
                    ) : (
                      <CreditCard size={20} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {account.type === 'venmo' ? 'Venmo' : 'Zelle'}
                      </Badge>
                      {account.qrCodeDataUrl && (
                        <Badge variant="outline" className="text-xs">QR</Badge>
                      )}
                    </div>
                    {account.accountIdentifier && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {account.accountIdentifier}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveAccount(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <BiometricReauth
        open={showReauth}
        onOpenChange={(open) => {
          setShowReauth(open)
          if (!open) {
            setPendingRemovalIndex(null)
          }
        }}
        onAuthenticated={handleAuthenticated}
        userId={profile.id}
        userEmail={profile.email}
        title={reauthAction === 'add' ? 'Verify Payment Account Addition' : 'Verify Payment Account Removal'}
        description={
          reauthAction === 'add' 
            ? 'Please verify your identity before adding a payment account'
            : 'Please verify your identity before removing a payment account'
        }
      />
    </Card>
  )
}
