import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Medal, CrownSimple } from '@phosphor-icons/react'
import { LeaderboardEntry, Group, UserProfile, Portfolio } from '@/lib/types'
import { formatPercent, formatCurrency } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  currentUser: UserProfile
}

export function Leaderboard({ entries, currentUserId, currentUser }: LeaderboardProps) {
  const [groups] = useKV<Record<string, Group>>('all-groups', {})
  const [allUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [allPortfolios] = useKV<Record<string, Portfolio>>('all-portfolios', {})
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all')

  const userGroups = currentUser.groupIds
    .map(id => groups?.[id])
    .filter(Boolean) as Group[]

  const getFilteredEntries = (): LeaderboardEntry[] => {
    if (selectedGroupId === 'all') {
      return entries
    }

    const group = groups?.[selectedGroupId]
    if (!group) return []

    const groupEntries: LeaderboardEntry[] = group.memberIds
      .map(userId => {
        const user = allUsers?.[userId]
        const portfolio = allPortfolios?.[userId]
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

    groupEntries.sort((a, b) => b.returnPercent - a.returnPercent)
    groupEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return groupEntries
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
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy size={28} weight="fill" className="text-accent" />
            Leaderboard
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Who's got the hottest hand this quarter? Time to find out.
          </p>
          
          {userGroups.length > 0 && (
            <div className="mt-4">
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  {userGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <Trophy size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedGroupId === 'all' 
                  ? "No traders yet. Be the first to build your portfolio!"
                  : "No members with portfolios in this group yet."
                }
              </p>
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
