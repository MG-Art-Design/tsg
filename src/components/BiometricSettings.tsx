import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UserProfile } from '@/lib/types'
import { toast } from 'sonner'
import { Fingerprint, FingerprintSimple, Check, Warning } from '@phosphor-icons/react'
import {
  checkBiometricSupport,
  registerBiometric,
  isBiometricEnabled,
  disableBiometric,
  type BiometricSupport
} from '@/lib/biometric'

interface BiometricSettingsProps {
  profile: UserProfile
}

export function BiometricSettings({ profile }: BiometricSettingsProps) {
  const [biometricSupport, setBiometricSupport] = useState<BiometricSupport>({ available: false, type: 'unknown' })
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const init = async () => {
      setIsChecking(true)
      const support = await checkBiometricSupport()
      setBiometricSupport(support)
      
      if (support.available) {
        const enabled = await isBiometricEnabled(profile.id)
        setIsEnabled(enabled)
      }
      setIsChecking(false)
    }
    init()
  }, [profile.id])

  const handleToggleBiometric = async (enabled: boolean) => {
    setIsLoading(true)

    try {
      if (enabled) {
        const success = await registerBiometric(profile.id, profile.email)
        
        if (success) {
          setIsEnabled(true)
          toast.success('Biometric authentication enabled', {
            description: `You can now sign in with ${biometricSupport.type === 'face' ? 'Face ID' : 'your fingerprint'}.`
          })
        } else {
          toast.error('Failed to enable biometric authentication', {
            description: 'Please try again or check your device settings.'
          })
        }
      } else {
        await disableBiometric(profile.id)
        setIsEnabled(false)
        toast.success('Biometric authentication disabled', {
          description: 'You will need to use your password to sign in.'
        })
      }
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FingerprintSimple size={24} weight="duotone" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>Checking device support...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!biometricSupport.available) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <FingerprintSimple size={24} weight="duotone" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>Not available on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-muted">
            <Warning size={20} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Biometric authentication is not supported</p>
              <p>Your device doesn't support biometric authentication, or it's not enabled in your browser settings.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getBiometricName = () => {
    switch (biometricSupport.type) {
      case 'face':
        return 'Face ID'
      case 'fingerprint':
        return 'Fingerprint'
      default:
        return 'Biometric'
    }
  }

  return (
    <Card className={isEnabled ? 'border-primary/30' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {biometricSupport.type === 'face' ? (
            <Fingerprint size={24} weight="duotone" className={isEnabled ? 'text-primary' : ''} />
          ) : (
            <FingerprintSimple size={24} weight="duotone" className={isEnabled ? 'text-primary' : ''} />
          )}
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Sign in quickly and securely with {getBiometricName()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnabled && (
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Check size={20} className="text-primary mt-0.5 flex-shrink-0" weight="bold" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Biometric sign-in is active</p>
              <p className="text-muted-foreground">
                You can sign in using {getBiometricName()} instead of your password.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor="biometric-toggle" className="text-base font-medium">
              Enable {getBiometricName()}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isEnabled 
                ? `Using ${getBiometricName()} for authentication` 
                : `Use ${getBiometricName()} to sign in faster`
              }
            </p>
          </div>
          <Switch
            id="biometric-toggle"
            checked={isEnabled}
            onCheckedChange={handleToggleBiometric}
            disabled={isLoading}
          />
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p className="mb-1">🔒 Your biometric data never leaves your device</p>
          <p>Authentication uses your device's secure enclave for maximum security.</p>
        </div>
      </CardContent>
    </Card>
  )
}
