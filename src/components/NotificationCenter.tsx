import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserProfile, Portfolio } from '@/lib/types'
import { toast } from 'sonner'
import { TrendUp, TrendDown, UserPlus, Trophy, Users } from '@phosphor-icons/react'

interface NotificationCenterProps {
  profile: UserProfile
  allUsers: Record<string, UserProfile>
  allPortfolios: Record<string, Portfolio>
}

interface NotificationState {
  lastLeaderboardPositions: Record<string, number>
  lastPortfolioValues: Record<string, number>
  lastRelationshipCheck: number
}

export function NotificationCenter({ profile, allUsers, allPortfolios }: NotificationCenterProps) {
  const [notificationState, setNotificationState] = useKV<NotificationState>('notification-state', {
    lastLeaderboardPositions: {},
    lastPortfolioValues: {},
    lastRelationshipCheck: Date.now()
  })

  useEffect(() => {
    if (!profile?.notificationPreferences || !notificationState) return

    const checkNotifications = () => {
      const friends = profile.friendIds
        .map(id => allUsers?.[id])
        .filter(Boolean) as UserProfile[]

      const friendsWithPortfolios = friends
        .map(friend => ({
          friend,
          portfolio: allPortfolios?.[friend.id]
        }))
        .filter(item => item.portfolio)

      if (profile.notificationPreferences.friendPortfolioUpdates) {
        friendsWithPortfolios.forEach(({ friend, portfolio }) => {
          if (!portfolio) return

          const lastValue = notificationState.lastPortfolioValues[friend.id]
          if (lastValue !== undefined && lastValue !== portfolio.currentValue) {
            const percentChange = ((portfolio.currentValue - lastValue) / lastValue) * 100
            
            if (Math.abs(percentChange) >= 5) {
              const relationship = profile.relationshipStatuses?.[friend.id] || 'friend'
              const isPositive = percentChange > 0

              toast(
                `${friend.username} (${relationship}) ${isPositive ? 'surging' : 'dropping'}!`,
                {
                  description: `Portfolio ${isPositive ? 'up' : 'down'} ${Math.abs(percentChange).toFixed(1)}% to $${portfolio.currentValue.toFixed(0)}`,
                  icon: isPositive ? <TrendUp size={20} weight="bold" className="text-success" /> : <TrendDown size={20} weight="bold" className="text-destructive" />,
                  duration: 5000,
                }
              )
            }
          }
        })
      }

      if (profile.notificationPreferences.leaderboardChanges) {
        const sortedFriends = friendsWithPortfolios
          .sort((a, b) => (b.portfolio?.totalReturnPercent || 0) - (a.portfolio?.totalReturnPercent || 0))

        sortedFriends.forEach(({ friend }, index) => {
          const currentRank = index + 1
          const lastRank = notificationState.lastLeaderboardPositions[friend.id]

          if (lastRank !== undefined && lastRank !== currentRank) {
            const rankChange = lastRank - currentRank
            const relationship = profile.relationshipStatuses?.[friend.id] || 'friend'

            if (rankChange > 0) {
              toast(
                `${friend.username} climbed to #${currentRank}!`,
                {
                  description: `Your ${relationship} moved up ${rankChange} ${rankChange === 1 ? 'spot' : 'spots'} on the leaderboard`,
                  icon: <Trophy size={20} weight="fill" className="text-accent" />,
                  duration: 5000,
                }
              )
            }
          }
        })
      }

      const newPortfolioValues: Record<string, number> = {}
      friendsWithPortfolios.forEach(({ friend, portfolio }) => {
        if (portfolio) {
          newPortfolioValues[friend.id] = portfolio.currentValue
        }
      })

      const newLeaderboardPositions: Record<string, number> = {}
      friendsWithPortfolios
        .sort((a, b) => (b.portfolio?.totalReturnPercent || 0) - (a.portfolio?.totalReturnPercent || 0))
        .forEach(({ friend }, index) => {
          newLeaderboardPositions[friend.id] = index + 1
        })

      setNotificationState({
        lastLeaderboardPositions: newLeaderboardPositions,
        lastPortfolioValues: newPortfolioValues,
        lastRelationshipCheck: Date.now()
      })
    }

    const interval = setInterval(checkNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [profile, allUsers, allPortfolios, notificationState])

  useEffect(() => {
    if (!profile?.notificationPreferences?.relationshipChanges || !notificationState) return

    const currentFriendCount = profile.friendIds.length
    const lastCheckedCount = notificationState.lastLeaderboardPositions 
      ? Object.keys(notificationState.lastLeaderboardPositions).length 
      : 0

    if (currentFriendCount > lastCheckedCount && lastCheckedCount > 0) {
      const newFriendIds = profile.friendIds.filter(
        id => !notificationState.lastLeaderboardPositions[id]
      )

      newFriendIds.forEach(friendId => {
        const friend = allUsers?.[friendId]
        if (friend) {
          const relationship = profile.relationshipStatuses?.[friendId] || 'friend'
          toast.success(
            `${friend.username} added as ${relationship}!`,
            {
              description: 'They now appear on your leaderboard',
              icon: <UserPlus size={20} weight="fill" />,
              duration: 5000,
            }
          )
        }
      })
    }
  }, [profile?.friendIds.length, profile?.relationshipStatuses, notificationState, allUsers])

  return null
}
