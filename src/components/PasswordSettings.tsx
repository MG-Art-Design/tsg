import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserProfile } from '@/lib/types'
import { LockKey, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { BiometricReauth } from '@/components/BiometricReauth'

interface PasswordSettingsProps {
  profile: UserProfile
}

export function PasswordSettings({ profile }: PasswordSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showReauth, setShowReauth] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [pendingNewPassword, setPendingNewPassword] = useState('')

  const handlePasswordChange = () => {
    if (!currentPassword.trim()) {
      toast.error('Please enter your current password')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setPendingNewPassword(newPassword)
    setShowReauth(true)
  }

  const handleAuthenticated = async () => {
    setIsChangingPassword(true)

    try {
      const storedPassword = await window.spark.kv.get<string>(`auth:${profile.email}`)

      if (storedPassword !== currentPassword) {
        toast.error('Current password is incorrect')
        setIsChangingPassword(false)
        return
      }

      await window.spark.kv.set(`auth:${profile.email}`, pendingNewPassword)

      toast.success('Password changed successfully', {
        description: 'Your password has been updated.'
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPendingNewPassword('')
    } catch (error) {
      toast.error('Failed to change password', {
        description: 'Please try again later.'
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleReauthCancel = () => {
    setPendingNewPassword('')
  }

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-destructive/10">
              <LockKey size={24} className="text-destructive" weight="fill" />
            </div>
            <div>
              <CardTitle>Password Settings</CardTitle>
              <CardDescription>
                Change your account password - requires biometric or password verification
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <ShieldCheck size={20} className="text-destructive mt-0.5 flex-shrink-0" weight="fill" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Security Notice</p>
              <p className="text-muted-foreground">
                Changing your password requires biometric authentication or password verification for your security.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-muted/50 border-border"
              />
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <BiometricReauth
        open={showReauth}
        onOpenChange={(open) => {
          setShowReauth(open)
          if (!open) {
            handleReauthCancel()
          }
        }}
        onAuthenticated={handleAuthenticated}
        userId={profile.id}
        userEmail={profile.email}
        title="Verify Password Change"
        description="Please verify your identity before changing your password"
      />
    </>
  )
}
