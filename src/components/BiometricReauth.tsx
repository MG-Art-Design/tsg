import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Fingerprint, FingerprintSimple, LockKey, Warning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { authenticateWithBiometric, isBiometricEnabled, checkBiometricSupport } from '@/lib/biometric'
import { toast } from 'sonner'

interface BiometricReauthProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthenticated: () => void
  userId: string
  userEmail: string
  title?: string
  description?: string
}

export function BiometricReauth({
  open,
  onOpenChange,
  onAuthenticated,
  userId,
  userEmail,
  title = 'Authentication Required',
  description = 'Please verify your identity to continue'
}: BiometricReauthProps) {
  const [password, setPassword] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'unknown'>('unknown')
  const [showPasswordFallback, setShowPasswordFallback] = useState(false)
  const [error, setError] = useState('')
  const [storedPassword, setStoredPassword] = useState<string | null>(null)

  useEffect(() => {
    const checkBiometric = async () => {
      const support = await checkBiometricSupport()
      setBiometricAvailable(support.available)
      setBiometricType(support.type)
      
      if (support.available) {
        const enabled = await isBiometricEnabled(userId)
        setBiometricEnabled(enabled)
        
        if (enabled && open) {
          attemptBiometricAuth()
        }
      } else {
        setShowPasswordFallback(true)
      }

      const savedPassword = await window.spark.kv.get<string>(`auth:${userEmail}`)
      setStoredPassword(savedPassword || null)
    }
    
    if (open) {
      setPassword('')
      setError('')
      setShowPasswordFallback(false)
      checkBiometric()
    }
  }, [open, userId, userEmail])

  const attemptBiometricAuth = async () => {
    setIsAuthenticating(true)
    setError('')

    try {
      const success = await authenticateWithBiometric(userId)
      
      if (success) {
        toast.success('Authentication successful')
        onAuthenticated()
        onOpenChange(false)
      } else {
        setError('Biometric authentication failed')
        setShowPasswordFallback(true)
      }
    } catch (error) {
      setError('Biometric authentication failed')
      setShowPasswordFallback(true)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handlePasswordAuth = () => {
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    if (!storedPassword) {
      setError('Password verification not available')
      return
    }

    if (password === storedPassword) {
      toast.success('Authentication successful')
      onAuthenticated()
      onOpenChange(false)
      setPassword('')
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const getBiometricName = () => {
    switch (biometricType) {
      case 'face':
        return 'Face ID'
      case 'fingerprint':
        return 'Fingerprint'
      default:
        return 'Biometric'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKey size={24} weight="bold" className="text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AnimatePresence mode="wait">
            {!showPasswordFallback && biometricEnabled && biometricAvailable ? (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div
                    animate={{
                      scale: isAuthenticating ? [1, 1.2, 1] : 1,
                      rotate: isAuthenticating ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                      duration: 1,
                      repeat: isAuthenticating ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {biometricType === 'face' ? (
                      <Fingerprint size={80} weight="duotone" className="text-primary" />
                    ) : (
                      <FingerprintSimple size={80} weight="duotone" className="text-primary" />
                    )}
                  </motion.div>
                  
                  <motion.p
                    className="text-center mt-6 text-foreground font-medium"
                    animate={{
                      opacity: isAuthenticating ? [1, 0.5, 1] : 1
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: isAuthenticating ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {isAuthenticating ? `Authenticating with ${getBiometricName()}...` : `Use ${getBiometricName()} to verify`}
                  </motion.p>

                  {!isAuthenticating && (
                    <Button
                      onClick={attemptBiometricAuth}
                      className="mt-6"
                      size="lg"
                    >
                      <Fingerprint size={20} weight="bold" className="mr-2" />
                      Authenticate with {getBiometricName()}
                    </Button>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <Warning size={18} className="text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                <Button
                  onClick={() => setShowPasswordFallback(true)}
                  variant="ghost"
                  className="w-full"
                  size="sm"
                >
                  Use password instead
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="reauth-password">Password</Label>
                  <Input
                    id="reauth-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordAuth()
                      }
                    }}
                    placeholder="Enter your password"
                    className="bg-muted/50"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <Warning size={18} className="text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordAuth}
                    className="flex-1"
                  >
                    Verify
                  </Button>
                </div>

                {biometricEnabled && biometricAvailable && (
                  <Button
                    onClick={() => {
                      setShowPasswordFallback(false)
                      setError('')
                      setPassword('')
                    }}
                    variant="ghost"
                    className="w-full"
                    size="sm"
                  >
                    Use {getBiometricName()} instead
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
