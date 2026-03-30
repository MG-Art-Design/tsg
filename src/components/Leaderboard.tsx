import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, CrownSimple, Medal, UserPlus, Heart, GraduationCap, Briefcase, House, Tag, Funnel } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { LeaderboardEntry, UserProfile, Portfolio, RelationshipStatus } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { HapticFeedback } from '@/lib/haptics'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  currentUser: UserProfile
  onAddFriendsClick: () => void
}

export function Leaderboard({ entries, currentUserId, currentUser, onAddFriendsClick }: LeaderboardProps) {
  const [allUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [allPortfolios] = useKV<Record<string, Portfolio>>('all-portfolios', {})
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipStatus | 'all'>('all')
  const previousRankRef = useRef<number | null>(null)

  const getFilteredEntries = (): LeaderboardEntry[] => {
    const friendEntries: LeaderboardEntry[] = (currentUser?.friendIds || [])
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

    let filtered = friendEntries
    if (relationshipFilter !== 'all') {
      filtered = friendEntries.filter(entry => {
        if (entry.userId === currentUserId) return true
        const status = currentUser.relationshipStatuses?.[entry.userId] || 'friend'
        return status === relationshipFilter
      })
    }

    filtered.sort((a, b) => b.returnPercent - a.returnPercent)
    filtered.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return filtered
  }

  const filteredEntries = getFilteredEntries()

  useEffect(() => {
    const currentEntry = filteredEntries.find(e => e.userId === currentUserId)
    if (currentEntry && previousRankRef.current !== null && previousRankRef.current !== currentEntry.rank) {
      HapticFeedback.rankChanged()
    }
    if (currentEntry) {
      previousRankRef.current = currentEntry.rank
    }
  }, [filteredEntries, currentUserId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownSimple size={24} weight="fill" className="text-yellow-400" />
    if (rank === 2) return <Medal size={24} weight="fill" className="text-gray-400" />
    if (rank === 3) return <Medal size={24} weight="fill" className="text-amber-600" />
    return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{rank}</div>
  }

  const getRankBorderClass = (rank: number, isPremium: boolean) => {
    if (rank === 1) {
      return isPremium 
        ? 'border-yellow-400/40 bg-yellow-400/5 glow-accent gold-shimmer-slow' 
        : 'border-yellow-400/40 bg-yellow-400/5 glow-accent'
    }
    if (rank === 2) {
      return isPremium
        ? 'border-gray-400/40 bg-gray-400/5 gold-shimmer-slow'
        : 'border-gray-400/40 bg-gray-400/5'
    }
    if (rank === 3) {
      return isPremium
        ? 'border-amber-600/40 bg-amber-600/5 gold-shimmer-slow'
        : 'border-amber-600/40 bg-amber-600/5'
    }
    return isPremium ? 'border-border gold-shimmer-slow' : 'border-border'
  }

  const getRelationshipBadge = (userId: string) => {
    if (userId === currentUserId) return null
    const status = currentUser.relationshipStatuses?.[userId] || 'friend'
    
    const badges: Record<RelationshipStatus, { icon: any; label: string; color: string }> = {
      friend: { icon: Heart, label: 'Friend', color: 'text-pink-400' },
      rival: { icon: Trophy, label: 'Rival', color: 'text-orange-400' },
      mentor: { icon: GraduationCap, label: 'Mentor', color: 'text-blue-400' },
      mentee: { icon: GraduationCap, label: 'Mentee', color: 'text-cyan-400' },
      colleague: { icon: Briefcase, label: 'Colleague', color: 'text-purple-400' },
      family: { icon: House, label: 'Family', color: 'text-green-400' },
      other: { icon: Tag, label: 'Other', color: 'text-gray-400' },
    }

    const badge = badges[status]
    const Icon = badge.icon

    return (
      <Badge variant="outline" className={`${badge.color} flex items-center gap-1 text-xs`}>
        <Icon size={12} weight="fill" />
        {badge.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[oklch(0.70_0.14_75)]">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                <Trophy size={20} weight="fill" className="text-accent sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="truncate">Leaderboard</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Compete with your friends. Only your added friends appear here.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Funnel size={16} className="text-muted-foreground sm:w-[18px] sm:h-[18px]" />
              <Select value={relationshipFilter} onValueChange={(value) => setRelationshipFilter(value as RelationshipStatus | 'all')}>
                <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Friends</SelectItem>
                  <SelectItem value="friend">Friends</SelectItem>
                  <SelectItem value="rival">Rivals</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="mentee">Mentees</SelectItem>
                  <SelectItem value="colleague">Colleagues</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardContent className="py-12 text-center">
              <UserPlus size={48} className="text-muted-foreground mx-auto mb-4" />
              {relationshipFilter === 'all' ? (
                <>
                  <p className="text-lg font-semibold mb-2">No friends yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add friends to compete on your personal leaderboard
                  </p>
                  <Button onClick={onAddFriendsClick} className="mx-auto">
                    <UserPlus size={18} weight="fill" className="mr-2" />
                    Add Friends
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">No {relationshipFilter}s found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    You haven't categorized any friends as {relationshipFilter}s yet. Update relationship statuses in your Profile tab.
                  </p>
                  <Button onClick={() => setRelationshipFilter('all')} variant="outline">
                    Show All Friends
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry, i) => {
            const entryUser = allUsers?.[entry.userId]
            const isPremium = entryUser?.subscription?.tier === 'premium'
            
            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className={`${getRankBorderClass(entry.rank, isPremium)} ${entry.userId === currentUserId ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">{entry.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-semibold truncate text-sm sm:text-base">{entry.username}</span>
                            {entry.userId === currentUserId && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2">You</Badge>
                            )}
                            {isPremium && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 text-[oklch(0.70_0.14_75)] border-[oklch(0.70_0.14_75)] gold-shimmer-fast">
                                Premium
                              </Badge>
                            )}
                            <div className="hidden xs:block">
                              {getRelationshipBadge(entry.userId)}
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">
                            {formatCurrency(entry.portfolioValue)} portfolio
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className={`text-base sm:text-xl md:text-2xl font-bold ${entry.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatPercent(entry.returnPercent)}
                        </div>
                        <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                          {formatCurrency(Math.abs(entry.returnValue))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
