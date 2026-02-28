import { 
  Group, 
  UserProfile, 
  Portfolio, 
  BettingPeriod, 
  PayoutNotification,
  GroupGameLeaderboardEntry 
} from './types'

export function calculatePeriodWinner(
  group: Group,
  allUsers: Record<string, UserProfile>,
  allPortfolios: Record<string, Portfolio>,
  periodType: 'weekly' | 'monthly' | 'season'
): BettingPeriod | null {
  if (!group.bettingSettings?.enabled) return null

  const memberIds = group.memberIds
  const standings = memberIds
    .map(userId => {
      const user = allUsers[userId]
      const portfolio = allPortfolios[userId]
      
      if (!user || !portfolio) return null

      return {
        userId,
        username: user.username,
        avatar: user.avatar,
        returnPercent: portfolio.totalReturnPercent,
        returnValue: portfolio.totalReturn
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b?.returnPercent || 0) - (a?.returnPercent || 0)) as Array<{
      userId: string
      username: string
      avatar: string
      returnPercent: number
      returnValue: number
    }>

  if (standings.length === 0) return null

  const winner = standings[0]
  const totalPot = group.bettingSettings.entryFee * memberIds.length
  let payout = totalPot

  if (group.bettingSettings.payoutStructure === 'top-3' && standings.length >= 3) {
    payout = totalPot * 0.5
  } else if (group.bettingSettings.payoutStructure === 'top-5' && standings.length >= 5) {
    payout = totalPot * 0.4
  }

  const amountOwed = group.bettingSettings.entryFee

  const period: BettingPeriod = {
    id: `${group.id}-${periodType}-${Date.now()}`,
    groupId: group.id,
    type: periodType,
    startDate: Date.now(),
    endDate: Date.now(),
    winnerId: winner.userId,
    winnerUsername: winner.username,
    winnerAvatar: winner.avatar,
    totalPot,
    payout,
    payoutStatus: 'pending',
    standings: standings.map(s => ({
      ...s,
      amountOwed: s.userId === winner.userId ? 0 : amountOwed
    }))
  }

  return period
}

export function calculateGameWinner(
  group: Group,
  leaderboard: GroupGameLeaderboardEntry[],
  allUsers: Record<string, UserProfile>,
  periodType: 'weekly' | 'monthly' | 'season'
): BettingPeriod | null {
  if (!group.bettingSettings?.enabled || leaderboard.length === 0) return null

  const winner = leaderboard[0]
  const memberIds = group.memberIds
  const totalPot = group.bettingSettings.entryFee * memberIds.length
  let payout = totalPot

  if (group.bettingSettings.payoutStructure === 'top-3' && leaderboard.length >= 3) {
    payout = totalPot * 0.5
  } else if (group.bettingSettings.payoutStructure === 'top-5' && leaderboard.length >= 5) {
    payout = totalPot * 0.4
  }

  const amountOwed = group.bettingSettings.entryFee

  const period: BettingPeriod = {
    id: `${group.id}-${periodType}-${Date.now()}`,
    groupId: group.id,
    gameId: winner.gameId,
    type: periodType,
    startDate: Date.now(),
    endDate: Date.now(),
    winnerId: winner.userId,
    winnerUsername: winner.username,
    winnerAvatar: winner.avatar,
    totalPot,
    payout,
    payoutStatus: 'pending',
    standings: leaderboard.map((entry, idx) => ({
      userId: entry.userId,
      username: entry.username,
      avatar: entry.avatar,
      returnPercent: entry.totalReturnPercent,
      returnValue: entry.totalReturnValue,
      amountOwed: idx === 0 ? 0 : amountOwed
    }))
  }

  return period
}

export function createPayoutNotification(
  period: BettingPeriod,
  group: Group,
  winner: UserProfile
): PayoutNotification {
  const memberPayments = period.standings
    .filter(s => s.userId !== period.winnerId)
    .map(s => ({
      userId: s.userId,
      username: s.username,
      avatar: s.avatar,
      amountOwed: s.amountOwed || 0,
      paymentStatus: 'pending' as const
    }))

  return {
    id: `payout-${period.id}`,
    groupId: group.id,
    periodId: period.id,
    periodType: period.type,
    winnerId: winner.id,
    winnerUsername: winner.username,
    winnerAvatar: winner.avatar,
    winnerPaymentAccounts: winner.paymentAccounts,
    totalPayout: period.payout,
    memberPayments,
    createdAt: Date.now(),
    groupName: group.name
  }
}

export function getActivePeriodType(
  group: Group,
  currentDate: Date = new Date()
): 'weekly' | 'monthly' | 'season' | null {
  if (!group.bettingSettings?.enabled) return null

  const dayOfWeek = currentDate.getDay()
  const dayOfMonth = currentDate.getDate()

  if (group.bettingSettings.weeklyEnabled && dayOfWeek === 0) {
    return 'weekly'
  }

  if (group.bettingSettings.monthlyEnabled && dayOfMonth === 1) {
    return 'monthly'
  }

  return null
}
