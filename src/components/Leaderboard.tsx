import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, CrownSimple, Medal, UserPlus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { LeaderboardEntry, UserProfile, Portfolio } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  currentUser: UserProfile
  onAddFriendsClick: () => void
}

export function Leaderboard({ entries, currentUserId, currentUser, onAddFriendsClick }: LeaderboardProps) {
  const [allUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [allPortfolios] = useKV<Record<string, Portfolio>>('all-portfolios', {})

  const getFilteredEntries = (): LeaderboardEntry[] => {
    const friendEntries: LeaderboardEntry[] = currentUser.friendIds
      .map(friendId => {
        const user = allUsers?.[friendId]
        const portfolio = allPortfolios?.[friendId]
        if (!user || !portfolio) return null

        return {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          returnPercent: portfolio.totalReturnPercent,
          returnValue: portfolio.totalReturn,
          rank: 0,
          portfolioValue: portfolio.currentValue,
        }
      })
      .filter(Boolean) as LeaderboardEntry[]

    const currentUserEntry = entries.find(e => e.userId === currentUserId)
    if (currentUserEntry && !friendEntries.some(e => e.userId === currentUserId)) {
      friendEntries.push(currentUserEntry)
    }

    friendEntries.sort((a, b) => b.returnPercent - a.returnPercent)
    friendEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return friendEntries
  }

  const filteredEntries = getFilteredEntries()

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownSimple size={24} weight="fill" className="text-yellow-400" />
    if (rank === 2) return <Medal size={24} weight="fill" className="text-gray-400" />
    if (rank === 3) return <Medal size={24} weight="fill" className="text-amber-600" />
    return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{rank}</div>
  }

  const getRankBorderClass = (rank: number) => {
    if (rank === 1) return 'border-yellow-400/40 bg-yellow-400/5 glow-accent'
    if (rank === 2) return 'border-gray-400/40 bg-gray-400/5'
    if (rank === 3) return 'border-amber-600/40 bg-amber-600/5'
    return 'border-border'
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[oklch(0.70_0.14_75)]">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Trophy size={24} weight="fill" className="text-accent sm:w-7 sm:h-7" />
            Leaderboard
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compete with your friends. Only your added friends appear here.
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardContent className="py-12 text-center">
              <UserPlus size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No friends yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add friends to compete on your personal leaderboard
              </p>
              <Button onClick={onAddFriendsClick} className="mx-auto">
                <UserPlus size={18} weight="fill" className="mr-2" />
                Add Friends
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry, i) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className={`${getRankBorderClass(entry.rank)} ${entry.userId === currentUserId ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-4xl">{entry.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{entry.username}</span>
                          {entry.userId === currentUserId && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(entry.portfolioValue)} portfolio
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-bold ${entry.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercent(entry.returnPercent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(Math.abs(entry.returnValue))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
