import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'
import { UserProfile } from '@/lib/types'
import { Envelope, Key, ArrowRight, Fingerprint, FingerprintSimple } from '@phosphor-icons/react'
import { 
  checkBiometricSupport, 
  authenticateWithBiometric, 
  getBiometricUsers,
  type BiometricSupport 
} from '@/lib/biometric'

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
          id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          friendCode: `TSG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="ripple-container fixed inset-0 pointer-events-none">
        <div className="ripple ripple-1" />
        <div className="ripple ripple-2" />
        <div className="ripple ripple-3" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo size="lg" animated />
          <p className="text-muted-foreground mt-4 text-lg">
            Compete with friends in quarterly trading competitions
          </p>
        </div>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Enter your email to get started' 
                : 'Sign in to continue competing'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showBiometricPrompt && !isSignUp && biometricUsers.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                    {biometricSupport.type === 'face' ? (
                      <Fingerprint size={32} weight="duotone" className="text-primary" />
                    ) : (
                      <FingerprintSimple size={32} weight="duotone" className="text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
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
                      className="w-full border-primary/30 hover:border-primary hover:bg-primary/5"
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
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </Button>
                  )
                })}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with password</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
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
                />
                {isSignUp && (
                  <p className="text-xs text-muted-foreground">
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
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Keep me signed in
                  </Label>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
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

              <div className="text-center pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp ? (
                    <>Already have an account? <span className="text-primary font-semibold">Sign In</span></>
                  ) : (
                    <>Don't have an account? <span className="text-primary font-semibold">Sign Up</span></>
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
