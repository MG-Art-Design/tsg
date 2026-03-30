import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendUp, TrendDown, Lightning, Trophy, CrownSimple, Medal, ChartLineUp, Star } from '@phosphor-icons/react'
import { Portfolio, Asset, InsiderTrade, UserProfile, LeaderboardEntry } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { motion } from 'framer-motion'
import { InsiderTrades } from './InsiderTrades'
import { InviteFriends } from './InviteFriends'
import { AnimatedPortfolioCounter } from './AnimatedPortfolioCounter'

interface DashboardProps {
  portfolio: Portfolio | null
  marketData: Asset[]
  userProfile: UserProfile
  onUpgradeClick: () => void
  insiderTrades: InsiderTrade[]
  onNavigateToLeaderboard?: () => void
}

export function Dashboard({ portfolio, marketData, userProfile, onUpgradeClick, insiderTrades, onNavigateToLeaderboard }: DashboardProps) {
  const safeMarketData = marketData || []
  const topGainers = [...safeMarketData].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h).slice(0, 3)
  const topLosers = [...safeMarketData].sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h).slice(0, 3)
  
  const previousValueRef = useRef(portfolio?.currentValue || 10000)
  const [allUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [allPortfolios] = useKV<Record<string, Portfolio>>('all-portfolios', {})
  const [userPortfolios] = useKV<Portfolio[]>('user-portfolios', [])

  useEffect(() => {
    if (portfolio?.currentValue && portfolio.currentValue !== previousValueRef.current) {
      previousValueRef.current = portfolio.currentValue
    }
  }, [portfolio?.currentValue])

  const userTier = userProfile.subscription?.tier || 'free'

  const getLeaderboardData = (): { quarterRank: number; lifetimeRank: number; leaderboardEntries: LeaderboardEntry[] } => {
    const friendEntries: LeaderboardEntry[] = (userProfile?.friendIds || [])
      .map(friendId => {
        const user = allUsers?.[friendId]
        const friendPortfolio = allPortfolios?.[friendId]
        if (!user || !friendPortfolio) return null

        return {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          returnPercent: friendPortfolio.totalReturnPercent,
          returnValue: friendPortfolio.totalReturn,
          rank: 0,
          portfolioValue: friendPortfolio.currentValue,
        }
      })
      .filter(Boolean) as LeaderboardEntry[]

    if (portfolio && !friendEntries.some(e => e.userId === userProfile.id)) {
      friendEntries.push({
        userId: userProfile.id,
        username: userProfile.username,
        avatar: userProfile.avatar,
        returnPercent: portfolio.totalReturnPercent,
        returnValue: portfolio.totalReturn,
        rank: 0,
        portfolioValue: portfolio.currentValue,
      })
    }

    friendEntries.sort((a, b) => b.returnPercent - a.returnPercent)
    friendEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    const currentUserEntry = friendEntries.find(e => e.userId === userProfile.id)
    const quarterRank = currentUserEntry?.rank || 0

    const lifetimePerformance = (userProfile?.friendIds || [])
      .map(friendId => {
        const user = allUsers?.[friendId]
        if (!user) return null

        const friendPortfolios = userPortfolios?.filter(p => p.userId === friendId) || []
        const totalValue = friendPortfolios.reduce((sum, p) => sum + p.currentValue, 0)
        const totalInitial = friendPortfolios.reduce((sum, p) => sum + p.initialValue, 0)
        const lifetimeReturn = totalInitial > 0 ? ((totalValue - totalInitial) / totalInitial) * 100 : 0

        return {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          lifetimeReturn,
          rank: 0,
        }
      })
      .filter(Boolean) as Array<{ userId: string; username: string; avatar: string; lifetimeReturn: number; rank: number }>

    const myPortfolios = userPortfolios?.filter(p => p.userId === userProfile.id) || []
    const myTotalValue = myPortfolios.reduce((sum, p) => sum + p.currentValue, 0)
    const myTotalInitial = myPortfolios.reduce((sum, p) => sum + p.initialValue, 0)
    const myLifetimeReturn = myTotalInitial > 0 ? ((myTotalValue - myTotalInitial) / myTotalInitial) * 100 : 0

    if (!lifetimePerformance.some(e => e.userId === userProfile.id)) {
      lifetimePerformance.push({
        userId: userProfile.id,
        username: userProfile.username,
        avatar: userProfile.avatar,
        lifetimeReturn: myLifetimeReturn,
        rank: 0,
      })
    }

    lifetimePerformance.sort((a, b) => b.lifetimeReturn - a.lifetimeReturn)
    lifetimePerformance.forEach((entry, index) => {
      entry.rank = index + 1
    })

    const currentLifetimeEntry = lifetimePerformance.find(e => e.userId === userProfile.id)
    const lifetimeRank = currentLifetimeEntry?.rank || 0

    return { quarterRank, lifetimeRank, leaderboardEntries: friendEntries }
  }

  const { quarterRank, lifetimeRank, leaderboardEntries } = getLeaderboardData()

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownSimple size={20} weight="fill" className="text-yellow-400" />
    if (rank === 2) return <Medal size={20} weight="fill" className="text-gray-400" />
    if (rank === 3) return <Medal size={20} weight="fill" className="text-amber-600" />
    return null
  }

  if (!portfolio || portfolio.positions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
          <CardContent className="pt-12 pb-12">
            <div className="text-center max-w-2xl mx-auto">
              <Lightning size={64} weight="duotone" className="mx-auto mb-6 text-primary opacity-60" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Welcome to TSG: The Stonk Game!</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                You've got {formatCurrency(10000)} burning a hole in your virtual pocket. Time to build your first portfolio and show everyone what you're made of.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Pick your stocks, choose your cryptos, and may the odds be ever in your favor. Head to the <strong>Edit</strong> tab to get started.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendUp size={18} weight="bold" className="text-success sm:w-5 sm:h-5" />
                Top Movers Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topGainers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-success font-medium flex items-center gap-1 justify-end">
                      <TrendUp size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendDown size={18} weight="bold" className="text-destructive sm:w-5 sm:h-5" />
                Biggest Drops Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLosers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-destructive font-medium flex items-center gap-1 justify-end">
                      <TrendDown size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <InsiderTrades trades={insiderTrades.slice(0, 2)} userTier={userTier} onUpgradeClick={onUpgradeClick} showLimited />

        <InviteFriends currentUserName={userProfile.username} currentUserEmail={userProfile.email} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatedPortfolioCounter
        currentValue={portfolio.currentValue}
        previousValue={previousValueRef.current}
        totalReturn={portfolio.totalReturn}
        totalReturnPercent={portfolio.totalReturnPercent}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <ChartLineUp size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
                <span className="truncate">Total Return</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${(portfolio?.totalReturnPercent ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercent(portfolio?.totalReturnPercent ?? 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {formatCurrency(Math.abs(portfolio?.totalReturn ?? 0))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Trophy size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
                <span className="truncate">Quarter Rank</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {quarterRank > 0 ? `#${quarterRank}` : '--'}
                </div>
                {quarterRank > 0 && getRankIcon(quarterRank)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {quarterRank > 0 ? `of ${leaderboardEntries.length} friends` : 'Add friends to compete'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Star size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
                <span className="truncate">Lifetime Rank</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {lifetimeRank > 0 ? `#${lifetimeRank}` : '--'}
                </div>
                {lifetimeRank > 0 && getRankIcon(lifetimeRank)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {lifetimeRank > 0 ? 'All-time performance' : 'Track lifetime progress'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {leaderboardEntries.length > 0 && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Trophy size={20} weight="fill" className="text-accent" />
                Quick Leaderboard
              </CardTitle>
              {onNavigateToLeaderboard && (
                <Button variant="ghost" size="sm" onClick={onNavigateToLeaderboard} className="text-xs">
                  View Full
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboardEntries.slice(0, 5).map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.4 + i * 0.05 }}
                className={`flex items-center gap-3 p-2 rounded-lg ${entry.userId === userProfile.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}
              >
                <div className="flex-shrink-0 w-6 text-center font-bold text-sm">
                  {entry.rank === 1 ? <CrownSimple size={18} weight="fill" className="text-yellow-400 inline" /> : 
                   entry.rank === 2 ? <Medal size={18} weight="fill" className="text-gray-400 inline" /> :
                   entry.rank === 3 ? <Medal size={18} weight="fill" className="text-amber-600 inline" /> :
                   `#${entry.rank}`}
                </div>
                <div className="text-2xl">{entry.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{entry.username}</span>
                    {entry.userId === userProfile.id && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(entry.portfolioValue)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-sm ${entry.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatPercent(entry.returnPercent)}
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendUp size={18} weight="bold" className="text-success sm:w-5 sm:h-5" />
                Top Movers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topGainers.map((asset, i) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-success font-medium flex items-center gap-1 justify-end">
                      <TrendUp size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendDown size={18} weight="bold" className="text-destructive sm:w-5 sm:h-5" />
                Biggest Drops
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLosers.map((asset, i) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-destructive font-medium flex items-center gap-1 justify-end">
                      <TrendDown size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <InsiderTrades trades={insiderTrades.slice(0, 2)} showLimited />

      <InviteFriends currentUserName={userProfile.username} currentUserEmail={userProfile.email} />

      {portfolio?.positions.length > 0 && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)]">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Your Top Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.positions.slice(0, 5).map((position, i) => (
                <motion.div
                  key={position.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={position.type === 'crypto' ? 'default' : 'secondary'}>
                      {position.type === 'crypto' ? '₿' : '$'}
                    </Badge>
                    <div>
                      <div className="font-semibold">{position.symbol}</div>
                      <div className="text-sm text-muted-foreground">{position.allocation}% allocation</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(position.value)}</div>
                    <div className={`text-sm font-medium ${position.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(position.returnPercent)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
