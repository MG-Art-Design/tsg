import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Group, UserProfile, GroupGame, GroupGamePick, Asset, GamePickPosition, GroupGameLeaderboardEntry } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { useActivityTracker } from '@/hooks/use-activity-tracker'
import { Trophy, Flame, Plus, Check, ArrowRight, Crown, Medal } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface GroupGameManagerProps {
  group: Group
  currentUser: UserProfile
  marketData: Asset[]
  allUsers: Record<string, UserProfile>
}

export function GroupGameManager({ group, currentUser, marketData, allUsers }: GroupGameManagerProps) {
  const [groupGames, setGroupGames] = useKV<Record<string, GroupGame>>('group-games', {})
  const [gamePicks, setGamePicks] = useKV<Record<string, GroupGamePick>>('game-picks', {})
  const activityTracker = useActivityTracker(currentUser.id)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [pickDialogOpen, setPickDialogOpen] = useState(false)
  const [gameName, setGameName] = useState('')
  const [gameDuration, setGameDuration] = useState<'1week' | '2weeks' | '1month'>('2weeks')
  const [allowStocks, setAllowStocks] = useState(true)
  const [allowCrypto, setAllowCrypto] = useState(true)
  const [selectedPicks, setSelectedPicks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const activeGame = group.activeGameId ? groupGames?.[group.activeGameId] : null
  const userPick = activeGame ? gamePicks?.[`${currentUser.id}-${activeGame.id}`] : null

  const getDurationInMs = (duration: string) => {
    const durations = {
      '1week': 7 * 24 * 60 * 60 * 1000,
      '2weeks': 14 * 24 * 60 * 60 * 1000,
      '1month': 30 * 24 * 60 * 60 * 1000,
    }
    return durations[duration as keyof typeof durations] || durations['2weeks']
  }

  const handleCreateGame = () => {
    if (!gameName.trim()) {
      toast.error('Game name is required')
      return
    }

    if (!allowStocks && !allowCrypto) {
      toast.error('Must allow at least one asset type')
      return
    }

    const allowedTypes: ('stock' | 'crypto')[] = []
    if (allowStocks) allowedTypes.push('stock')
    if (allowCrypto) allowedTypes.push('crypto')

    const startDate = Date.now()
    const endDate = startDate + getDurationInMs(gameDuration)

    const newGame: GroupGame = {
      id: `game-${Date.now()}`,
      groupId: group.id,
      name: gameName.trim(),
      startDate,
      endDate,
      isActive: true,
      maxPicks: 3,
      allowedTypes,
      createdBy: currentUser.id,
    }

    setGroupGames(current => ({ ...(current || {}), [newGame.id]: newGame }))

    toast.success(`New game "${newGame.name}" started! 🎮`, {
      description: 'Members can now submit their 3 picks'
    })

    setGameName('')
    setCreateDialogOpen(false)
  }

  const handleSubmitPicks = () => {
    if (!activeGame) return

    if (selectedPicks.length !== 3) {
      toast.error('You must select exactly 3 picks')
      return
    }

    const picks: GamePickPosition[] = selectedPicks.map(symbol => {
      const asset = marketData.find(a => a.symbol === symbol)!
      return {
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        entryPrice: asset.currentPrice,
        currentPrice: asset.currentPrice,
        returnPercent: 0,
        returnValue: 0,
      }
    })

    const isUpdate = !!userPick

    const newPick: GroupGamePick = {
      userId: currentUser.id,
      gameId: activeGame.id,
      picks,
      submittedAt: Date.now(),
    }

    setGamePicks(current => ({
      ...(current || {}),
      [`${currentUser.id}-${activeGame.id}`]: newPick
    }))

    activityTracker.recordGameEvent(activeGame.id, {
      type: isUpdate ? 'game_pick_updated' : 'game_pick_submitted',
      data: {
        gameName: activeGame.name,
        pickCount: picks.length
      },
      metadata: {
        picks
      }
    })

    toast.success(isUpdate ? 'Picks updated! 🔥' : 'Picks submitted! 🔥', {
      description: 'Good luck! May the best trader win.'
    })

    setSelectedPicks([])
    setPickDialogOpen(false)
  }

  const togglePick = (symbol: string) => {
    if (selectedPicks.includes(symbol)) {
      setSelectedPicks(selectedPicks.filter(s => s !== symbol))
    } else if (selectedPicks.length < 3) {
      setSelectedPicks([...selectedPicks, symbol])
    } else {
      toast.error('Maximum 3 picks allowed')
    }
  }

  const filteredAssets = marketData.filter(asset => {
    if (!activeGame) return false
    if (!activeGame.allowedTypes.includes(asset.type)) return false
    if (searchQuery && !asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  useEffect(() => {
    if (!activeGame || !marketData.length) return

    const pickKeys = Object.keys(gamePicks || {}).filter(key => key.endsWith(`-${activeGame.id}`))
    
    pickKeys.forEach(key => {
      const pick = gamePicks?.[key]
      if (!pick) return

      const updatedPicks = pick.picks.map(position => {
        const currentAsset = marketData.find(a => a.symbol === position.symbol)
        if (!currentAsset) return position

        const returnValue = currentAsset.currentPrice - position.entryPrice
        const returnPercent = (returnValue / position.entryPrice) * 100

        return {
          ...position,
          currentPrice: currentAsset.currentPrice,
          returnValue,
          returnPercent,
        }
      })

      setGamePicks(current => ({
        ...(current || {}),
        [key]: {
          ...pick,
          picks: updatedPicks
        }
      }))
    })
  }, [marketData, activeGame?.id])

  const getGameLeaderboard = (): GroupGameLeaderboardEntry[] => {
    if (!activeGame) return []

    const entries: GroupGameLeaderboardEntry[] = []

    Object.entries(gamePicks || {}).forEach(([key, pick]) => {
      if (!key.endsWith(`-${activeGame.id}`)) return

      const totalReturn = pick.picks.reduce((sum, p) => sum + p.returnValue, 0)
      const totalReturnPercent = pick.picks.reduce((sum, p) => sum + p.returnPercent, 0) / pick.picks.length

      const user = allUsers?.[pick.userId]
      if (!user) return

      entries.push({
        userId: pick.userId,
        username: user.username,
        avatar: user.avatar,
        gameId: activeGame.id,
        totalReturnPercent,
        totalReturnValue: totalReturn,
        picks: pick.picks,
        rank: 0,
      })
    })

    entries.sort((a, b) => b.totalReturnPercent - a.totalReturnPercent)
    entries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return entries
  }

  const leaderboard = getGameLeaderboard()
  const hasSubmitted = !!userPick
  const gameEnded = activeGame && Date.now() > activeGame.endDate

  useEffect(() => {
    if (gameEnded && activeGame && userPick) {
      const userEntry = leaderboard.find(e => e.userId === currentUser.id)
      if (userEntry) {
        activityTracker.updateGameSummary(
          activeGame.id,
          userEntry.rank,
          userEntry.totalReturnPercent
        )

        activityTracker.recordGameEvent(activeGame.id, {
          type: 'game_completed',
          data: {
            gameName: activeGame.name,
            finalRank: userEntry.rank,
            totalReturn: userEntry.totalReturnPercent,
            participantCount: leaderboard.length
          }
        })
      }
    }
  }, [gameEnded, activeGame?.id, leaderboard.length])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} weight="fill" className="text-yellow-400" />
    if (rank === 2) return <Medal size={20} weight="fill" className="text-gray-400" />
    if (rank === 3) return <Medal size={20} weight="fill" className="text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.08_0.006_70)] shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame size={24} weight="fill" className="text-orange-400" />
                Group Game
              </CardTitle>
              <CardDescription>
                3-pick competition with group members
              </CardDescription>
            </div>
            {!activeGame && group.createdBy === currentUser.id && (
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus size={18} weight="bold" />
                New Game
              </Button>
            )}
          </div>
        </CardHeader>

        {activeGame && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{activeGame.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {gameEnded ? 'Game Ended' : `Ends ${new Date(activeGame.endDate).toLocaleDateString()}`}
                </p>
              </div>
              {!hasSubmitted && !gameEnded && (
                <Button onClick={() => setPickDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                  Submit Picks
                </Button>
              )}
            </div>

            {hasSubmitted && (
              <div className="p-4 border-2 border-border rounded-lg bg-muted/30">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Check size={16} weight="bold" className="text-success" />
                  Your Picks
                </h4>
                <div className="space-y-2">
                  {userPick.picks.map((pick, index) => (
                    <div key={pick.symbol} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{pick.symbol}</span>
                        <Badge variant="outline" className="text-xs">{pick.type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${pick.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatPercent(pick.returnPercent)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leaderboard.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Trophy size={16} weight="fill" />
                  Live Standings
                </h4>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 border-2 rounded-lg ${
                        entry.userId === currentUser.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRankIcon(entry.rank)}
                          <div className="text-2xl">{entry.avatar}</div>
                          <div>
                            <div className="font-semibold text-sm">{entry.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.picks.length} picks
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${entry.totalReturnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatPercent(entry.totalReturnPercent)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {!activeGame && (
          <CardContent className="text-center py-8 text-muted-foreground">
            <Flame size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active game. Start a new competition!</p>
          </CardContent>
        )}
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Group Game</DialogTitle>
            <DialogDescription>
              Create a 3-pick competition for group members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="game-name">Game Name</Label>
              <Input
                id="game-name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Q1 2025 Showdown"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={gameDuration} onValueChange={(value) => setGameDuration(value as any)}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Allowed Assets</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="stocks"
                    checked={allowStocks}
                    onCheckedChange={(checked) => setAllowStocks(!!checked)}
                  />
                  <Label htmlFor="stocks" className="cursor-pointer">Stocks</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="crypto"
                    checked={allowCrypto}
                    onCheckedChange={(checked) => setAllowCrypto(!!checked)}
                  />
                  <Label htmlFor="crypto" className="cursor-pointer">Crypto</Label>
                </div>
              </div>
            </div>
            <Button onClick={handleCreateGame} className="w-full">
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pickDialogOpen} onOpenChange={setPickDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Submit Your 3 Picks</DialogTitle>
            <DialogDescription>
              Choose 3 assets you think will perform best
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {selectedPicks.length} / 3 selected
              </Badge>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredAssets.map(asset => {
                const isSelected = selectedPicks.includes(asset.symbol)
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => togglePick(asset.symbol)}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{asset.type}</Badge>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                          <div className={`text-xs ${asset.priceChangePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatPercent(asset.priceChangePercent24h)}
                          </div>
                        </div>
                        {isSelected && <Check size={20} weight="bold" className="text-primary" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <Button 
              onClick={handleSubmitPicks} 
              className="w-full"
              disabled={selectedPicks.length !== 3}
            >
              Submit Picks <ArrowRight size={18} weight="bold" className="ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
