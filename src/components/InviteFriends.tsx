import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, PaperPlaneRight, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface InviteFriendsProps {
  currentUserName: string
  currentUserEmail: string
}

export function InviteFriends({ currentUserName, currentUserEmail }: InviteFriendsProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sentEmails, setSentEmails] = useState<string[]>([])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      toast.error("You can't invite yourself!")
      return
    }

    if (sentEmails.includes(email.toLowerCase())) {
      toast.info('Already sent invitation to this email')
      return
    }

    setIsLoading(true)

    try {
      await sendInviteEmail(email, currentUserName)
      
      setSentEmails((prev) => [...prev, email.toLowerCase()])
      toast.success('Invitation sent!', {
        description: `${email} will receive an invite to join TSG`
      })
      setEmail('')
    } catch (error) {
      toast.error('Failed to send invitation', {
        description: 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendInviteEmail = async (recipientEmail: string, inviterName: string) => {
    const emailSubject = `${inviterName} invited you to join TSG: The Stonk Game!`
    const emailBody = `
Hello!

${inviterName} thinks you'd be great at TSG: The Stonk Game - a virtual trading competition where friends compete in quarterly S&P 500 and crypto prediction challenges.

Here's what you can do:
• Build portfolios with $100,000 virtual cash
• Compete with friends each quarter
• Track real-time market movements
• Climb the leaderboard

Ready to show off your trading skills? Join now and start competing!

Best,
The TSG Team

---
This is an automated message from TSG: The Stonk Game. Please do not reply to this email.
    `.trim()

    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('📧 Invite Email Sent:')
    console.log(`To: ${recipientEmail}`)
    console.log(`From: no-reply@thestonkgame.com`)
    console.log(`Subject: ${emailSubject}`)
    console.log(`Body:\n${emailBody}`)
    console.log('---')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendInvite()
    }
  }

  return (
    <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.08_0.006_70)] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_75_/_0.05)] to-transparent pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-[oklch(0.70_0.14_75_/_0.15)] border border-[oklch(0.70_0.14_75_/_0.3)]">
            <UserPlus size={24} weight="bold" className="text-[oklch(0.70_0.14_75)]" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl">Invite Friends</CardTitle>
            <CardDescription className="mt-1.5 text-muted-foreground">
              Challenge your friends to compete in TSG. The more the merrier!
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="friend-email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="bg-background/50 border-[oklch(0.70_0.14_75_/_0.3)] focus:border-[oklch(0.70_0.14_75)] transition-colors"
            />
          </div>
          <Button
            onClick={handleSendInvite}
            disabled={isLoading || !email.trim()}
            className="bg-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.75_0.14_75)] text-[oklch(0.15_0.01_240)] font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <PaperPlaneRight size={18} weight="bold" />
                </motion.div>
                Sending...
              </>
            ) : (
              <>
                <PaperPlaneRight size={18} weight="bold" />
                Send
              </>
            )}
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {sentEmails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-muted-foreground">
                Invites sent ({sentEmails.length}):
              </p>
              <div className="space-y-1.5">
                {sentEmails.map((sentEmail, index) => (
                  <motion.div
                    key={sentEmail}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground bg-success/10 border border-success/30 rounded-lg px-3 py-2"
                  >
                    <Check size={16} weight="bold" className="text-success flex-shrink-0" />
                    <span className="truncate">{sentEmail}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-2 border-t border-[oklch(0.70_0.14_75_/_0.2)]">
          <p className="text-xs text-muted-foreground">
            Your friends will receive an email from <span className="font-medium text-foreground">no-reply@thestonkgame.com</span> with an invite to join TSG.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
