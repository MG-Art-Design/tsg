import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Group, 
  UserProfile, 
  GroupGame, 
  GroupGameLeaderboardEntry,
  PayoutNotification,
  BettingHistoryEntry
} from '@/lib/types'
import { calculateGameWinner, createPayoutNotification, recordBettingHistory } from '@/lib/bettingHelpers'
import { toast } from 'sonner'

export function useBettingPayouts(
  group: Group | null,
  activeGame: GroupGame | null,
  leaderboard: GroupGameLeaderboardEntry[],
  allUsers: Record<string, UserProfile>
) {
  const [, setGroups] = useKV<Record<string, Group>>('all-groups', {})
  const [, setPayoutNotifications] = useKV<PayoutNotification[]>('payout-notifications', [])
  const [processedGames, setProcessedGames] = useKV<string[]>('processed-betting-games', [])
  const [, setBettingHistory] = useKV<BettingHistoryEntry[]>('betting-history', [])

  useEffect(() => {
    if (!group || !activeGame || !group.bettingSettings?.enabled) return
    if (Date.now() < activeGame.endDate) return
    if ((processedGames || []).includes(activeGame.id)) return
    if (leaderboard.length === 0) return

    const winner = allUsers[leaderboard[0].userId]
    if (!winner) return

    const gameEndDate = new Date(activeGame.endDate)
    const gameStartDate = new Date(activeGame.startDate)
    const gameDuration = gameEndDate.getTime() - gameStartDate.getTime()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    const oneMonth = 30 * 24 * 60 * 60 * 1000

    let periodType: 'weekly' | 'monthly' | 'season' = 'season'
    
    if (group.bettingSettings.weeklyEnabled && gameDuration <= oneWeek + 86400000) {
      periodType = 'weekly'
    } else if (group.bettingSettings.monthlyEnabled && gameDuration <= oneMonth + 86400000) {
      periodType = 'monthly'
    } else if (group.bettingSettings.seasonEnabled) {
      periodType = 'season'
    }

    const bettingPeriod = calculateGameWinner(group, leaderboard, allUsers, periodType)
    if (!bettingPeriod) return

    bettingPeriod.endDate = activeGame.endDate
    bettingPeriod.startDate = activeGame.startDate
    bettingPeriod.payoutStatus = 'notified'
    bettingPeriod.payoutNotifiedAt = Date.now()

    const notification = createPayoutNotification(bettingPeriod, group, winner)

    const historyEntries = recordBettingHistory(bettingPeriod, group)
    
    setBettingHistory((current) => [...(current || []), ...historyEntries])

    setGroups((current) => ({
      ...(current || {}),
      [group.id]: {
        ...group,
        bettingPeriods: [...(group.bettingPeriods || []), bettingPeriod]
      }
    }))

    setPayoutNotifications((current) => [...(current || []), notification])

    setProcessedGames((current) => [...(current || []), activeGame.id])

    const winnerPayouts = bettingPeriod.winnerPayouts || []
    if (winnerPayouts.length > 1) {
      toast.success(`🏆 Top ${winnerPayouts.length} split the ${periodType} pot!`, {
        description: `${winnerPayouts.map(w => `${w.username}: $${w.payout.toFixed(2)}`).join(' • ')}`
      })
    } else {
      toast.success(`🏆 ${winner.username} won the ${periodType} pot!`, {
        description: `$${bettingPeriod.payout.toFixed(2)} payout ready • Check Betting tab`
      })
    }
  }, [activeGame?.id, activeGame?.endDate, leaderboard.length, processedGames?.length])
}
