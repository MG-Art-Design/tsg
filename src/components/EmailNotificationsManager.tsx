import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserProfile, Portfolio, LeaderboardEntry, Insight } from '@/lib/types'
import { generateEmailContent, shouldSendEmail } from '@/lib/emailHelpers'
import { toast } from 'sonner'

interface EmailNotificationsManagerProps {
  profile: UserProfile
  portfolio: Portfolio | null
  leaderboardEntries: LeaderboardEntry[]
  insights: Insight[]
}

export function EmailNotificationsManager({
  profile,
  portfolio,
  leaderboardEntries,
  insights,
}: EmailNotificationsManagerProps) {
  const [emailQueue, setEmailQueue] = useKV<Array<{
    userId: string
    emailAddress: string
    subject: string
    content: string
    scheduledTime: number
    sent: boolean
  }>>('email-queue', [])

  useEffect(() => {
    if (!profile.emailNotifications?.enabled || !profile.emailNotifications?.email) {
      return
    }

    const checkAndScheduleEmail = () => {
      const shouldSend = shouldSendEmail(
        profile.emailNotifications.frequency,
        profile.emailNotifications.lastSent
      )

      if (shouldSend && portfolio) {
        const emailContent = generateEmailContent({
          profile,
          portfolio,
          leaderboardEntries,
          insights,
          preferences: profile.emailNotifications,
        })

        const newEmail = {
          userId: profile.id,
          emailAddress: profile.emailNotifications.email,
          subject: emailContent.subject,
          content: emailContent.htmlContent,
          scheduledTime: Date.now(),
          sent: false,
        }

        setEmailQueue((current) => [...(current || []), newEmail])

        toast.success('📧 Email notification scheduled', {
          description: `Your ${profile.emailNotifications.frequency} update is ready to be sent to ${profile.emailNotifications.email}`,
        })
      }
    }

    const interval = setInterval(checkAndScheduleEmail, 3600000)
    checkAndScheduleEmail()

    return () => clearInterval(interval)
  }, [
    profile.id,
    profile.emailNotifications?.enabled,
    profile.emailNotifications?.frequency,
    profile.emailNotifications?.lastSent,
    portfolio?.lastUpdated,
  ])

  useEffect(() => {
    const processEmailQueue = async () => {
      const unsentEmails = (emailQueue || []).filter((email) => !email.sent)

      if (unsentEmails.length > 0) {
        for (const email of unsentEmails) {
          console.log('📧 Email ready to send:', {
            to: email.emailAddress,
            subject: email.subject,
            scheduledAt: new Date(email.scheduledTime).toLocaleString(),
          })

          toast.info('Email notification prepared', {
            description: `Ready to send to ${email.emailAddress}`,
            duration: 5000,
          })

          setEmailQueue((current) =>
            (current || []).map((e) =>
              e.scheduledTime === email.scheduledTime && e.userId === email.userId
                ? { ...e, sent: true }
                : e
            )
          )
        }
      }
    }

    if (emailQueue && emailQueue.length > 0) {
      processEmailQueue()
    }
  }, [emailQueue?.length])

  return null
}
