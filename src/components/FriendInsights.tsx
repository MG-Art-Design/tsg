import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserProfile, Portfolio, ActivityEvent } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, TrendUp, TrendDown, Plus, Minus, ArrowsLeftRight, FolderOpen, Clock, Crown } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/helpers'
import { useKV } from '@github/spark/hooks'

interface FriendInsightsProps {
  userProfile: UserProfile
}

interface FriendActivity {
  friendId: string
  friendUsername: string
  friendAvatar: string
  event: ActivityEvent
  portfolioSnapshot?: Portfolio
}

export function FriendInsights({ userProfile }: FriendInsightsProps) {
  const [allUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [allPortfolios] = useKV<Record<string, Portfolio>>('all-portfolios', {})
  const [activityHistory] = useKV<Record<string, any>>('activity-history', {})
  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>([])
  const [filter, setFilter] = useState<'all' | 'portfolio_created' | 'portfolio_updated'>('all')

  useEffect(() => {
    if (!userProfile.friendIds || userProfile.friendIds.length === 0) {
      setFriendActivities([])
      return
    }

    const activities: FriendActivity[] = []

    userProfile.friendIds.forEach(friendId => {
      const friend = allUsers?.[friendId]
      if (!friend) return

      const friendHistoryKeys = Object.keys(activityHistory || {}).filter(key => 
        key.startsWith(`${friendId}-`)
      )

      friendHistoryKeys.forEach(historyKey => {
        const history = activityHistory?.[historyKey]
        if (!history?.events) return

        history.events.forEach((event: ActivityEvent) => {
          if (event.type === 'portfolio_created' || event.type === 'portfolio_updated') {
            activities.push({
              friendId,
              friendUsername: friend.username,
              friendAvatar: friend.avatar,
              event,
              portfolioSnapshot: allPortfolios?.[friendId]
            })
          }
        })
      })
    })

    activities.sort((a, b) => b.event.timestamp - a.event.timestamp)
    setFriendActivities(activities)
  }, [userProfile.friendIds, allUsers, allPortfolios, activityHistory])

  const filteredActivities = filter === 'all' 
    ? friendActivities 
    : friendActivities.filter(activity => activity.event.type === filter)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'portfolio_created':
        return <Plus size={16} weight="bold" />
      case 'portfolio_updated':
        return <ArrowsLeftRight size={16} weight="bold" />
      default:
        return <FolderOpen size={16} weight="bold" />
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'portfolio_created':
        return 'Created Portfolio'
      case 'portfolio_updated':
        return 'Updated Portfolio'
      default:
        return 'Portfolio Activity'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'portfolio_created':
        return 'bg-[oklch(0.70_0.12_145_/_0.2)] text-[oklch(0.70_0.12_145)] border-[oklch(0.70_0.12_145_/_0.4)]'
      case 'portfolio_updated':
        return 'bg-[oklch(0.68_0.08_220_/_0.2)] text-[oklch(0.68_0.08_220)] border-[oklch(0.68_0.08_220_/_0.4)]'
      default:
        return 'bg-[oklch(0.70_0.14_75_/_0.2)] text-[oklch(0.70_0.14_75)] border-[oklch(0.70_0.14_75_/_0.4)]'
    }
  }

  if (!userProfile.friendIds || userProfile.friendIds.length === 0) {
    return (
      <Card className="border-2 border-[oklch(0.70_0.14_75)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.70_0.14_75_/_0.2)] border border-[oklch(0.70_0.14_75_/_0.5)]">
              <Users size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Friend Insights</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Track your friends' portfolio moves and strategies
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Users size={64} className="text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-foreground mb-2">
            No Friends Added Yet
          </p>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add friends to see their portfolio activity and learn from their trading strategies. Competition makes everyone better!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[oklch(0.70_0.14_75)]">
      <CardHeader className="border-b border-[oklch(0.70_0.14_75_/_0.3)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.70_0.14_75_/_0.2)] border border-[oklch(0.70_0.14_75_/_0.5)]">
              <Users size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Friend Insights</CardTitle>
              <p className="text-xs sm:text-sm text-[oklch(0.60_0.10_75)] mt-1">
                {userProfile.friendIds.length} {userProfile.friendIds.length === 1 ? 'friend' : 'friends'} • {filteredActivities.length} recent {filteredActivities.length === 1 ? 'move' : 'moves'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'all' 
                ? 'bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)]'
                : 'border-[oklch(0.70_0.14_75_/_0.3)] text-[oklch(0.70_0.14_75)]'
              }
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('portfolio_created')}
              variant={filter === 'portfolio_created' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'portfolio_created'
                ? 'bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)]'
                : 'border-[oklch(0.70_0.14_75_/_0.3)] text-[oklch(0.70_0.14_75)]'
              }
            >
              Created
            </Button>
            <Button
              onClick={() => setFilter('portfolio_updated')}
              variant={filter === 'portfolio_updated' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'portfolio_updated'
                ? 'bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)]'
                : 'border-[oklch(0.70_0.14_75_/_0.3)] text-[oklch(0.70_0.14_75)]'
              }
            >
              Updated
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {filteredActivities.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <FolderOpen size={64} className="text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">
                No portfolio activity from your friends yet
              </p>
              <p className="text-sm text-[oklch(0.50_0.08_75)] mt-2">
                {filter !== 'all' ? 'Try changing the filter to see more activities' : 'Check back soon as your friends make moves'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="activities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredActivities.map((activity, i) => (
                <motion.div
                  key={`${activity.friendId}-${activity.event.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border border-[oklch(0.70_0.14_75_/_0.3)] hover:border-[oklch(0.70_0.14_75_/_0.6)] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-3xl">{activity.friendAvatar}</div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-[oklch(0.75_0.14_75)]">
                          {activity.friendUsername}
                        </span>
                        <Badge variant="outline" className={getActivityColor(activity.event.type)}>
                          {getActivityIcon(activity.event.type)}
                          <span className="ml-1">{getActivityLabel(activity.event.type)}</span>
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-[oklch(0.55_0.10_75)]">
                          <Clock size={12} />
                          {formatDistanceToNow(activity.event.timestamp, { addSuffix: true })}
                        </div>
                      </div>

                      {activity.event.data && (
                        <div className="space-y-2">
                          {activity.event.data.portfolioName && (
                            <p className="text-sm text-[oklch(0.65_0.10_75)]">
                              <span className="font-medium text-[oklch(0.70_0.14_75)]">
                                {activity.event.data.portfolioName}
                              </span>
                            </p>
                          )}
                          
                          {(activity.event.data.positionsCount || activity.event.data.stocksCount !== undefined) && (
                            <div className="flex flex-wrap gap-3 text-xs">
                              {activity.event.data.positionsCount && (
                                <div className="flex items-center gap-1">
                                  <FolderOpen size={14} className="text-[oklch(0.65_0.10_75)]" />
                                  <span className="text-[oklch(0.65_0.10_75)]">
                                    {activity.event.data.positionsCount} positions
                                  </span>
                                </div>
                              )}
                              {activity.event.data.stocksCount !== undefined && (
                                <div className="flex items-center gap-1">
                                  <TrendUp size={14} className="text-[oklch(0.70_0.12_145)]" />
                                  <span className="text-[oklch(0.65_0.10_75)]">
                                    {activity.event.data.stocksCount} stocks
                                  </span>
                                </div>
                              )}
                              {activity.event.data.cryptoCount !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Crown size={14} className="text-[oklch(0.70_0.14_75)]" />
                                  <span className="text-[oklch(0.65_0.10_75)]">
                                    {activity.event.data.cryptoCount} crypto
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activity.portfolioSnapshot && (
                        <div className="mt-3 pt-3 border-t border-[oklch(0.70_0.14_75_/_0.2)]">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-[oklch(0.55_0.10_75)] mb-1">Current Value</p>
                              <p className="text-base font-bold text-[oklch(0.75_0.14_75)]">
                                {formatCurrency(activity.portfolioSnapshot.currentValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[oklch(0.55_0.10_75)] mb-1">Total Return</p>
                              <div className="flex items-center gap-1">
                                {activity.portfolioSnapshot.totalReturn >= 0 ? (
                                  <TrendUp size={16} weight="bold" className="text-[oklch(0.70_0.12_145)]" />
                                ) : (
                                  <TrendDown size={16} weight="bold" className="text-[oklch(0.58_0.18_25)]" />
                                )}
                                <p className={`text-base font-bold ${
                                  activity.portfolioSnapshot.totalReturn >= 0 
                                    ? 'text-[oklch(0.70_0.12_145)]' 
                                    : 'text-[oklch(0.58_0.18_25)]'
                                }`}>
                                  {activity.portfolioSnapshot.totalReturnPercent >= 0 ? '+' : ''}
                                  {activity.portfolioSnapshot.totalReturnPercent.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
