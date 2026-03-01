import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'
import { UserProfile } from '@/lib/types'
import { Envelope, Key, ArrowRight, Fingerprint, FingerprintSimple, ShieldCheck } from '@phosphor-icons/react'
import { 
  checkBiometricSupport, 
  authenticateWithBiometric, 
  getBiometricUsers,
  type BiometricSupport 
} from '@/lib/biometric'
import { validateAdminCredentials, setAdminSession } from '@/lib/admin'

function generateSecureRandomString(length: number): string {
  // Generate a random base-36 string using a cryptographically secure RNG
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint32Array(2)
    window.crypto.getRandomValues(bytes)
    const base36 = Array.from(bytes)
      .map((b) => b.toString(36))
      .join('')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
    return base36.padEnd(length, '0').slice(0, length)
  }
  // Fallback: use Math.random if crypto is unavailable (older environments)
  return Math.random().toString(36).substring(2, 2 + length)
}

function generateSecureFriendCode(): string {
  // Generate an 8-character uppercase base-36 string using a cryptographically secure RNG
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0].toString(36).toUpperCase().padStart(8, '0').slice(0, 8)
  }
  // Fallback: use Math.random if crypto is unavailable (older environments)
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

interface AuthProps {
  onAuthenticated: (profile: UserProfile) => void
  existingUsers: Record<string, UserProfile>
}

export function Auth({ onAuthenticated, existingUsers }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [biometricSupport, setBiometricSupport] = useState<BiometricSupport>({ available: false, type: 'unknown' })
  const [biometricUsers, setBiometricUsers] = useState<Array<{ userId: string; email: string }>>([])
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)

  useEffect(() => {
    const initBiometric = async () => {
      const support = await checkBiometricSupport()
      setBiometricSupport(support)
      
      if (support.available) {
        const users = await getBiometricUsers()
        setBiometricUsers(users)
        
        if (users.length > 0) {
          setShowBiometricPrompt(true)
        }
      }
    }
    initBiometric()
  }, [])

  const handleBiometricSignIn = async (userToAuth?: { userId: string; email: string }) => {
    setIsLoading(true)

    try {
      let targetUser = userToAuth

      if (!targetUser && biometricUsers.length === 1) {
        targetUser = biometricUsers[0]
      }

      if (!targetUser) {
        toast.error('No biometric user selected')
        setIsLoading(false)
        return
      }

      const existingUser = Object.values(existingUsers).find(u => u.id === targetUser.userId)
      
      if (!existingUser) {
        toast.error('User not found', {
          description: 'Please sign in with email and password.'
        })
        setIsLoading(false)
        return
      }

      const authenticated = await authenticateWithBiometric(targetUser.userId)

      if (authenticated) {
        await window.spark.kv.set('currentUserId', existingUser.id)
        await window.spark.kv.set('rememberMe', true)
        await window.spark.kv.set('rememberedUserId', existingUser.id)
        
        toast.success(`Welcome back, ${existingUser.username}!`, {
          description: `Signed in with ${biometricSupport.type === 'face' ? 'Face ID' : 'biometrics'}`
        })
        onAuthenticated(existingUser)
      } else {
        toast.error('Biometric authentication failed', {
          description: 'Please try again or use password.'
        })
      }
    } catch (error) {
      toast.error('Authentication error', {
        description: 'Please use email and password to sign in.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const findUserByEmail = (email: string): UserProfile | undefined => {
    return Object.values(existingUsers).find(user => user.email.toLowerCase() === email.toLowerCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (validateAdminCredentials(email, password)) {
      setAdminSession(true)
      toast.success('Admin Mode Activated', {
        description: 'You\'re in read-only preview mode with demo data.'
      })
      
      const adminProfile: UserProfile = {
        id: 'admin-demo-user',
        email: 'admin@thestonkgame.com',
        username: 'Admin Preview',
        avatar: '👑',
        friendCode: 'ADMIN-000',
        friendIds: [],
        relationshipStatuses: {},
        subscription: {
          tier: 'premium',
          autoRenew: true,
          startDate: Date.now(),
          endDate: Date.now() + 365 * 24 * 60 * 60 * 1000
        },
        notificationPreferences: {
          relationshipChanges: true,
          friendPortfolioUpdates: true,
          leaderboardChanges: true,
          groupActivity: true,
          groupGameInvites: true
        },
        sharingPreferences: {
          shareWithFriends: true,
          shareWithGroups: [],
          shareActivityHistory: true,
          shareGameSummaries: true,
          sharePerformanceMetrics: true
        },
        bio: 'Admin Preview Mode',
        insightFrequency: 'daily',
        emailNotifications: {
          enabled: true,
          email: 'admin@thestonkgame.com',
          frequency: 'daily',
          includeLeaderboard: true,
          includeMarketPerformance: true,
          includeInsights: true
        },
        createdAt: Date.now(),
        groupIds: []
      }
      
      onAuthenticated(adminProfile)
      setIsLoading(false)
      return
    }

    if (!validateEmail(email)) {
      toast.error('Invalid email address')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const existingUser = findUserByEmail(email)

      if (isSignUp) {
        if (existingUser) {
          toast.error('Email already registered', {
            description: 'Try logging in instead.'
          })
          setIsLoading(false)
          return
        }

        const savedPassword = await window.spark.kv.get<string>(`auth:${email}`)
        if (savedPassword) {
          toast.error('Email already registered', {
            description: 'Try logging in instead.'
          })
          setIsLoading(false)
          return
        }

        await window.spark.kv.set(`auth:${email}`, password)
        
        toast.success('Account created!', {
          description: 'Complete your profile to get started.'
        })

        const tempProfile: Partial<UserProfile> = {
          email,
          id: `user-${Date.now()}-${generateSecureRandomString(8)}`,
          friendCode: `TSG-${generateSecureFriendCode()}`
        }

        onAuthenticated(tempProfile as UserProfile)
      } else {
        if (!existingUser) {
          toast.error('Account not found', {
            description: 'Check your email or sign up.'
          })
          setIsLoading(false)
          return
        }

        const savedPassword = await window.spark.kv.get<string>(`auth:${email}`)
        
        if (savedPassword !== password) {
          toast.error('Incorrect password')
          setIsLoading(false)
          return
        }

        await window.spark.kv.set('currentUserId', existingUser.id)
        
        if (rememberMe) {
          await window.spark.kv.set('rememberMe', true)
          await window.spark.kv.set('rememberedUserId', existingUser.id)
        } else {
          await window.spark.kv.delete('rememberMe')
          await window.spark.kv.delete('rememberedUserId')
        }
        
        toast.success(`Welcome back, ${existingUser.username}!`)
        onAuthenticated(existingUser)
      }
    } catch (error) {
      toast.error('Authentication failed', {
        description: 'Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.05_0.008_70)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-pool-container fixed inset-0 pointer-events-none">
        <div className="auth-pool-ripple auth-pool-ripple-1" />
        <div className="auth-pool-ripple auth-pool-ripple-2" />
        <div className="auth-pool-ripple auth-pool-ripple-3" />
        <div className="auth-pool-ripple auth-pool-ripple-4" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo size="lg" animated />
          <p className="text-[oklch(0.70_0.14_75)] mt-4 text-lg font-semibold tracking-wide">
            Compete with friends in quarterly trading competitions
          </p>
        </div>

        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-[oklch(0.03_0.006_70)] shadow-[0_0_40px_oklch(0.65_0.12_75_/_0.25),0_0_80px_oklch(0.65_0.12_75_/_0.15)] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.70_0.14_75_/_0.05)] via-transparent to-[oklch(0.70_0.14_75_/_0.03)] pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl text-[oklch(0.70_0.14_75)]">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-[oklch(0.58_0.02_240)]">
              {isSignUp 
                ? 'Enter your email to get started' 
                : 'Sign in to continue competing'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {showBiometricPrompt && !isSignUp && biometricUsers.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[oklch(0.70_0.14_75_/_0.15)] border-2 border-[oklch(0.70_0.14_75_/_0.4)] mb-3 shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.3)]">
                    {biometricSupport.type === 'face' ? (
                      <Fingerprint size={32} weight="duotone" className="text-[oklch(0.70_0.14_75)]" />
                    ) : (
                      <FingerprintSimple size={32} weight="duotone" className="text-[oklch(0.70_0.14_75)]" />
                    )}
                  </div>
                  <p className="text-sm text-[oklch(0.58_0.02_240)] mb-4">
                    Sign in quickly with {biometricSupport.type === 'face' ? 'Face ID' : 'biometrics'}
                  </p>
                </div>

                {biometricUsers.map((user) => {
                  const existingUser = Object.values(existingUsers).find(u => u.id === user.userId)
                  return (
                    <Button
                      key={user.userId}
                      onClick={() => handleBiometricSignIn(user)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full border-2 border-[oklch(0.70_0.14_75_/_0.4)] hover:border-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.70_0.14_75_/_0.1)] bg-[oklch(0.05_0.008_70)] hover:shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300 text-[oklch(0.70_0.14_75)]"
                      size="lg"
                    >
                      <div className="flex items-center gap-3 w-full">
                        {biometricSupport.type === 'face' ? (
                          <Fingerprint size={20} weight="duotone" />
                        ) : (
                          <FingerprintSimple size={20} weight="duotone" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{existingUser?.username || user.email}</div>
                          <div className="text-xs text-[oklch(0.58_0.02_240)]">{user.email}</div>
                        </div>
                      </div>
                    </Button>
                  )
                })}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[oklch(0.28_0.02_240)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[oklch(0.03_0.006_70)] px-2 text-[oklch(0.58_0.02_240)]">Or continue with password</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                  <Envelope size={16} />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                  <Key size={16} />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={6}
                  className="border-2 border-[oklch(0.70_0.14_75_/_0.3)] bg-[oklch(0.05_0.008_70)] text-[oklch(0.92_0.01_240)] focus:border-[oklch(0.70_0.14_75)] focus:shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all duration-300"
                />
                {isSignUp && (
                  <p className="text-xs text-[oklch(0.58_0.02_240)]">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              {!isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-[oklch(0.70_0.14_75_/_0.5)] data-[state=checked]:bg-[oklch(0.70_0.14_75)] data-[state=checked]:border-[oklch(0.70_0.14_75)]"
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal cursor-pointer text-[oklch(0.58_0.02_240)] hover:text-[oklch(0.70_0.14_75)] transition-colors"
                  >
                    Keep me signed in
                  </Label>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.75_0.16_75)] text-[oklch(0.05_0.008_70)] font-bold shadow-[0_0_30px_oklch(0.65_0.12_75_/_0.4)] hover:shadow-[0_0_40px_oklch(0.65_0.12_75_/_0.6)] transition-all duration-300 border-2 border-[oklch(0.70_0.14_75)]" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Please wait...'
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={18} weight="bold" className="ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center pt-4 border-t border-[oklch(0.28_0.02_240)]">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-[oklch(0.58_0.02_240)] hover:text-[oklch(0.70_0.14_75)] transition-colors"
                >
                  {isSignUp ? (
                    <>Already have an account? <span className="text-[oklch(0.70_0.14_75)] font-semibold">Sign In</span></>
                  ) : (
                    <>Don't have an account? <span className="text-[oklch(0.70_0.14_75)] font-semibold">Sign Up</span></>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
