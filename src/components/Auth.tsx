import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'
import { UserProfile } from '@/lib/types'
import { Envelope, Key, ArrowRight } from '@phosphor-icons/react'

interface AuthProps {
  onAuthenticated: (profile: UserProfile) => void
  existingUsers: Record<string, UserProfile>
}

export function Auth({ onAuthenticated, existingUsers }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
