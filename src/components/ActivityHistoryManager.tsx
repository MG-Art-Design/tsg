import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ActivityEvent, ActivityHistoryEntry, GameActivityLog, UserProfile, Group, SharingPreferences } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { ClockClockwise, ShareNetwork, TrendUp, TrendDown, Lightning, Trophy, Sparkle, Crown, Medal } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ActivityHistoryManagerProps {
  currentUser: UserProfile
  onUpdate: (updatedUser: UserProfile) => void
  userGroups?: Group[]
}

export function ActivityHistoryManager({ currentUser, onUpdate, userGroups = [] }: ActivityHistoryManagerProps) {
  const [activityHistory, setActivityHistory] = useKV<Record<string, ActivityHistoryEntry>>('activity-history', {})
  const [gameActivityLogs, setGameActivityLogs] = useKV<Record<string, GameActivityLog>>('game-activity-logs', {})
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false)

  const userHistory = Object.values(activityHistory || {}).filter(h => h.userId === currentUser.id)
  const userGameLogs = Object.values(gameActivityLogs || {}).filter(l => l.userId === currentUser.id)

  const sharingPrefs: SharingPreferences = currentUser.sharingPreferences || {
    shareWithFriends: false,
    shareWithGroups: [],
    shareActivityHistory: true,
    shareGameSummaries: true,
    sharePerformanceMetrics: true
  }

  const handleUpdateSharingPreferences = (updates: Partial<SharingPreferences>) => {
    const updatedPrefs = { ...sharingPrefs, ...updates }
    onUpdate({
      ...currentUser,
      sharingPreferences: updatedPrefs
    })
    toast.success('Sharing preferences updated')
  }

  const handleToggleGroupSharing = (groupId: string, enabled: boolean) => {
    const updatedGroups = enabled
      ? [...(sharingPrefs.shareWithGroups || []), groupId]
      : (sharingPrefs.shareWithGroups || []).filter(id => id !== groupId)
    
    handleUpdateSharingPreferences({ shareWithGroups: updatedGroups })
  }

  const generateQuarterSummary = async (quarter: string) => {
    setIsGeneratingSummary(true)
    
    try {
      const historyEntry = Object.values(activityHistory || {}).find(
        h => h.userId === currentUser.id && h.quarter === quarter
      )

      if (!historyEntry || historyEntry.events.length === 0) {
        toast.error('No activity data available for this quarter')
        setIsGeneratingSummary(false)
        return
      }

      const portfolioEvents = historyEntry.events.filter(e => 
        e.type === 'portfolio_created' || e.type === 'portfolio_updated'
      )
      const gameEvents = historyEntry.events.filter(e => 
        e.type === 'game_pick_submitted' || e.type === 'game_pick_updated'
      )
      const milestoneEvents = historyEntry.events.filter(e => 
        e.type === 'milestone_reached' || e.type === 'rank_changed'
      )

      const returnPercent = historyEntry.totalReturnPercent
      const returnValue = historyEntry.totalReturn

      const portfolioActivity = portfolioEvents.slice(0, 3)
        .map(e => `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.data.action || 'Portfolio adjustment'}`)
        .join('\n')

      const promptText = `You are the sassy, witty narrator for TSG: The Stonk Game. Generate a performance summary for ${currentUser.username}'s ${quarter} trading quarter.

Key Stats:
- Total Return: ${formatPercent(returnPercent)} (${formatCurrency(returnValue)})
- Starting Value: ${formatCurrency(historyEntry.quarterStartValue)}
- Ending Value: ${formatCurrency(historyEntry.quarterEndValue)}
- Portfolio Changes: ${portfolioEvents.length} times
- Game Participations: ${gameEvents.length}
- Milestones Hit: ${milestoneEvents.length}

Portfolio Activity:
${portfolioActivity}

Write a 3-paragraph summary in TSG's signature style:
1. Opening hook - comment on their overall performance with personality
2. Trading behavior analysis - what kind of trader they were this quarter (bold risk-taker? cautious strategist? panic seller?)
3. Forward-looking closer - sassy advice for next quarter

Keep it under 200 words. Be witty but not mean. Use emojis sparingly (max 3). Make it personal and memorable.`

      const summary = await window.spark.llm(promptText)

      setActivityHistory(current => ({
        ...(current || {}),
        [`${currentUser.id}-${quarter}`]: {
          ...historyEntry,
          summary,
          generatedAt: Date.now()
        }
      }))

      toast.success('Quarter summary generated! 📊', {
        description: 'Your performance story is ready'
      })
    } catch (error) {
      toast.error('Failed to generate summary', {
        description: 'Try again in a moment'
      })
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const generateGameSummary = async (gameLog: GameActivityLog) => {
    setIsGeneratingSummary(true)
    
    try {
      const pickEvents = gameLog.events.filter(e => 
        e.type === 'game_pick_submitted' || e.type === 'game_pick_updated'
      )

      const finalPick = pickEvents[pickEvents.length - 1]
      const picks = finalPick?.metadata?.picks || []
      const picksText = picks.map((p, i) => `${i + 1}. ${p.name} (${p.symbol}): ${formatPercent(p.returnPercent)}`).join('\n')

      const promptText = `You are the sassy narrator for TSG: The Stonk Game. Generate a game performance summary for ${currentUser.username}.

Game Performance:
- Final Rank: ${gameLog.finalRank ? `#${gameLog.finalRank}` : 'N/A'}
- Total Return: ${gameLog.totalReturn !== undefined ? formatPercent(gameLog.totalReturn) : 'N/A'}
- Number of Picks: ${picks.length}
- Pick Changes Made: ${pickEvents.length - 1}

Picks:
${picksText}

Write a 2-paragraph roast/celebration of their game performance:
1. Open with their rank and overall performance (winner gets celebration, losers get loving roasts)
2. Call out their best and worst picks with personality

Keep it under 150 words. Be playful and memorable. Use 1-2 emojis max.`

      const summary = await window.spark.llm(promptText)

      setGameActivityLogs(current => ({
        ...(current || {}),
        [gameLog.id]: {
          ...gameLog,
          summary,
          generatedAt: Date.now()
        }
      }))

      toast.success('Game summary generated! 🎮')
    } catch (error) {
      toast.error('Failed to generate game summary')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'portfolio_created':
      case 'portfolio_updated':
        return <Lightning size={16} weight="fill" className="text-primary" />
      case 'game_pick_submitted':
      case 'game_pick_updated':
        return <Trophy size={16} weight="fill" className="text-accent" />
      case 'rank_changed':
        return <TrendUp size={16} className="text-success" />
      case 'milestone_reached':
        return <Sparkle size={16} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
      default:
        return <ClockClockwise size={16} className="text-muted-foreground" />
    }
  }

  const getEventDescription = (event: ActivityEvent) => {
    switch (event.type) {
      case 'portfolio_created':
        return `Created portfolio with ${event.metadata?.positions?.length || 0} positions`
      case 'portfolio_updated':
        return `Updated portfolio allocation`
      case 'game_pick_submitted':
        return `Submitted game picks: ${event.metadata?.picks?.map(p => p.symbol).join(', ')}`
      case 'game_pick_updated':
        return `Changed game picks`
      case 'rank_changed':
        return `Rank moved from #${event.metadata?.oldRank} to #${event.metadata?.newRank}`
      case 'milestone_reached':
        return event.data.milestone || 'Achievement unlocked'
      default:
        return 'Activity recorded'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.16_0.012_240)] shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.15)]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClockClockwise size={24} weight="bold" className="text-[oklch(0.70_0.14_75)]" />
                Activity History
              </CardTitle>
              <CardDescription>
                Your trading journey with AI-powered summaries
              </CardDescription>
            </div>
            <Dialog open={sharingDialogOpen} onOpenChange={setSharingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ShareNetwork size={16} />
                  Share Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Activity Sharing</DialogTitle>
                  <DialogDescription>
                    Control who can see your trading activity and summaries
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="share-friends">Share with all friends</Label>
                    <Switch
                      id="share-friends"
                      checked={sharingPrefs.shareWithFriends}
                      onCheckedChange={(checked) => 
                        handleUpdateSharingPreferences({ shareWithFriends: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Share with groups</Label>
                    {userGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No groups yet</p>
                    ) : (
                      <div className="space-y-2">
                        {userGroups.map(group => (
                          <div key={group.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`group-${group.id}`}
                              checked={sharingPrefs.shareWithGroups?.includes(group.id)}
                              onCheckedChange={(checked) => 
                                handleToggleGroupSharing(group.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`group-${group.id}`} className="font-normal">
                              {group.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <Label>What to share</Label>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="share-history" className="font-normal">Activity timeline</Label>
                      <Switch
                        id="share-history"
                        checked={sharingPrefs.shareActivityHistory}
                        onCheckedChange={(checked) => 
                          handleUpdateSharingPreferences({ shareActivityHistory: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="share-summaries" className="font-normal">Game summaries</Label>
                      <Switch
                        id="share-summaries"
                        checked={sharingPrefs.shareGameSummaries}
                        onCheckedChange={(checked) => 
                          handleUpdateSharingPreferences({ shareGameSummaries: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="share-metrics" className="font-normal">Performance metrics</Label>
                      <Switch
                        id="share-metrics"
                        checked={sharingPrefs.sharePerformanceMetrics}
                        onCheckedChange={(checked) => 
                          handleUpdateSharingPreferences({ sharePerformanceMetrics: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quarters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quarters">Quarterly Performance</TabsTrigger>
              <TabsTrigger value="games">Game History</TabsTrigger>
            </TabsList>

            <TabsContent value="quarters" className="space-y-4 mt-4">
              {userHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClockClockwise size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No quarterly activity yet</p>
                  <p className="text-sm mt-2">Start trading to build your history</p>
                </div>
              ) : (
                userHistory.sort((a, b) => b.quarterStartValue - a.quarterStartValue).map(history => (
                  <motion.div
                    key={history.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border border-border">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{history.quarter}</CardTitle>
                            <CardDescription className="flex items-center gap-3 mt-1">
                              <span className={history.totalReturnPercent >= 0 ? 'text-success' : 'text-destructive'}>
                                {history.totalReturnPercent >= 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
                              </span>
                              <span className={history.totalReturnPercent >= 0 ? 'text-success' : 'text-destructive'}>
                                {formatPercent(history.totalReturnPercent)} ({formatCurrency(history.totalReturn)})
                              </span>
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => generateQuarterSummary(history.quarter)}
                            disabled={isGeneratingSummary}
                            className="gap-2"
                          >
                            <Sparkle size={16} weight="fill" />
                            {history.summary ? 'Regenerate' : 'Generate'} Summary
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {history.summary && (
                          <div className="bg-gradient-to-r from-[oklch(0.08_0.006_70)] to-[oklch(0.10_0.005_60)] border-2 border-[oklch(0.70_0.14_75_/_0.3)] rounded-lg p-4">
                            <div className="flex items-start gap-2 mb-2">
                              <Sparkle size={20} weight="fill" className="text-[oklch(0.70_0.14_75)] flex-shrink-0 mt-1" />
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{history.summary}</p>
                            </div>
                            {history.generatedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Generated {new Date(history.generatedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Activity Timeline ({history.events.length} events)</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {history.events.slice(0, 10).map(event => (
                              <div key={event.id} className="flex items-start gap-2 text-sm">
                                {getEventIcon(event.type)}
                                <div className="flex-1">
                                  <p>{getEventDescription(event)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="games" className="space-y-4 mt-4">
              {userGameLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No game history yet</p>
                  <p className="text-sm mt-2">Join a group game to track your performance</p>
                </div>
              ) : (
                userGameLogs.sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0)).map(log => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border border-border">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              Game #{log.gameId.slice(-8)}
                              {log.finalRank && log.finalRank <= 3 && (
                                <Badge variant="outline" className="gap-1">
                                  {log.finalRank === 1 && <Crown size={14} weight="fill" className="text-[oklch(0.70_0.14_75)]" />}
                                  {log.finalRank === 2 && <Medal size={14} weight="fill" className="text-muted-foreground" />}
                                  {log.finalRank === 3 && <Medal size={14} className="text-muted-foreground" />}
                                  #{log.finalRank}
                                </Badge>
                              )}
                            </CardTitle>
                            {log.totalReturn !== undefined && (
                              <CardDescription className="flex items-center gap-2 mt-1">
                                {log.totalReturn >= 0 ? (
                                  <TrendUp size={16} className="text-success" />
                                ) : (
                                  <TrendDown size={16} className="text-destructive" />
                                )}
                                <span className={log.totalReturn >= 0 ? 'text-success' : 'text-destructive'}>
                                  {formatPercent(log.totalReturn)}
                                </span>
                              </CardDescription>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => generateGameSummary(log)}
                            disabled={isGeneratingSummary}
                            className="gap-2"
                          >
                            <Sparkle size={16} weight="fill" />
                            {log.summary ? 'Regenerate' : 'Generate'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {log.summary && (
                          <div className="bg-gradient-to-r from-[oklch(0.08_0.006_70)] to-[oklch(0.10_0.005_60)] border-2 border-[oklch(0.70_0.14_75_/_0.3)] rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Sparkle size={20} weight="fill" className="text-[oklch(0.70_0.14_75)] flex-shrink-0 mt-1" />
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{log.summary}</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Game Activity ({log.events.length} events)</h4>
                          <div className="space-y-2">
                            {log.events.map(event => (
                              <div key={event.id} className="flex items-start gap-2 text-sm">
                                {getEventIcon(event.type)}
                                <div className="flex-1">
                                  <p>{getEventDescription(event)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(event.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
