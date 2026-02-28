import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserProfile, BettingHistoryEntry, Group } from '@/lib/types'
import { calculateUserBettingStats } from '@/lib/bettingHelpers'
import { 
  TrendUp, 
  TrendDown, 
  Trophy, 
  ChartLine, 
  CalendarCheck,
  CurrencyDollar,
  Minus
} from '@phosphor-icons/react'

interface BettingHistoryAnalyticsProps {
  profile: UserProfile
}

export function BettingHistoryAnalytics({ profile }: BettingHistoryAnalyticsProps) {
  const [allBettingHistory] = useKV<BettingHistoryEntry[]>('betting-history', [])
  const [allGroups] = useKV<Record<string, Group>>('all-groups', {})

  const stats = useMemo(() => {
    const history = (allBettingHistory || []).filter(h => h.userId === profile.id)
    return calculateUserBettingStats(profile.id, history, allGroups || {})
  }, [allBettingHistory, profile.id, allGroups])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (stats.totalGames === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={24} />
            Betting Analytics
          </CardTitle>
          <CardDescription>
            No betting history yet. Join a group with betting enabled to start tracking your performance!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine size={24} />
          Betting Analytics
        </CardTitle>
        <CardDescription>
          Your complete betting performance across all groups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Net Profit/Loss</CardDescription>
              <CardTitle className={`text-2xl flex items-center gap-2 ${
                stats.netProfit > 0 ? 'text-success' : stats.netProfit < 0 ? 'text-destructive' : ''
              }`}>
                {stats.netProfit > 0 ? (
                  <TrendUp size={20} weight="bold" />
                ) : stats.netProfit < 0 ? (
                  <TrendDown size={20} weight="bold" />
                ) : (
                  <Minus size={20} weight="bold" />
                )}
                {formatCurrency(Math.abs(stats.netProfit))}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Winnings</CardDescription>
              <CardTitle className="text-2xl text-success flex items-center gap-2">
                <CurrencyDollar size={20} weight="fill" />
                {formatCurrency(stats.totalWinnings)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Win Rate</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy size={20} weight="fill" />
                {stats.winRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Avg Rank</CardDescription>
              <CardTitle className="text-2xl">
                #{stats.averageRank.toFixed(1)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Games Played</CardDescription>
              <CardTitle className="text-xl">{stats.totalGames}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Games Won</CardDescription>
              <CardTitle className="text-xl text-success">{stats.gamesWon}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Best Rank</CardDescription>
              <CardTitle className="text-xl">#{stats.bestRank}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Separator />

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="by-period">By Period</TabsTrigger>
            <TabsTrigger value="by-group">By Group</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {stats.history.map((entry) => (
                  <Card key={entry.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={entry.rank === 1 ? 'default' : 'secondary'}>
                              Rank #{entry.rank} of {entry.totalParticipants}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {entry.periodType}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold">{entry.groupName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarCheck size={12} />
                            {formatDate(entry.timestamp)}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={entry.returnPercent >= 0 ? 'text-success' : 'text-destructive'}>
                              {entry.returnPercent >= 0 ? '+' : ''}{entry.returnPercent.toFixed(2)}%
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className={entry.returnValue >= 0 ? 'text-success' : 'text-destructive'}>
                              {formatCurrency(entry.returnValue)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.amountWon && entry.amountWon > 0 ? (
                            <div className="space-y-1">
                              <Badge variant="default" className="bg-success text-success-foreground">
                                Won
                              </Badge>
                              <p className="text-lg font-bold text-success">
                                +{formatCurrency(entry.amountWon)}
                              </p>
                            </div>
                          ) : entry.amountLost && entry.amountLost > 0 ? (
                            <div className="space-y-1">
                              <Badge variant="destructive">
                                Lost
                              </Badge>
                              <p className="text-lg font-bold text-destructive">
                                -{formatCurrency(entry.amountLost)}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Badge variant="secondary">
                                Break Even
                              </Badge>
                              <p className="text-lg font-bold text-muted-foreground">
                                {formatCurrency(0)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="by-period" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['weekly', 'monthly', 'season'] as const).map((period) => {
                const data = stats.byPeriodType[period]
                return (
                  <Card key={period}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{period}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Winnings:</span>
                        <span className="font-semibold text-success">{formatCurrency(data.wins)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Losses:</span>
                        <span className="font-semibold text-destructive">{formatCurrency(data.losses)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-bold">
                        <span>Net:</span>
                        <span className={data.net >= 0 ? 'text-success' : 'text-destructive'}>
                          {data.net >= 0 ? '+' : ''}{formatCurrency(data.net)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="by-group" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.byGroup).map(([groupId, data]) => (
                <Card key={groupId}>
                  <CardHeader>
                    <CardTitle className="text-base">{data.groupName}</CardTitle>
                    <CardDescription>{data.gamesPlayed} games played</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Winnings:</span>
                      <span className="font-semibold text-success">{formatCurrency(data.wins)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Losses:</span>
                      <span className="font-semibold text-destructive">{formatCurrency(data.losses)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold">
                      <span>Net:</span>
                      <span className={data.net >= 0 ? 'text-success' : 'text-destructive'}>
                        {data.net >= 0 ? '+' : ''}{formatCurrency(data.net)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
