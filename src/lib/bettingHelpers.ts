import { 
  Group, 
  UserProfile, 
  Portfolio, 
  BettingPeriod, 
  PayoutNotification,
  GroupGameLeaderboardEntry,
  BettingHistoryEntry,
  UserBettingStats
} from './types'

export function calculateTieredPayouts(
  totalPot: number,
  payoutStructure: 'winner-take-all' | 'top-3' | 'top-5',
  numParticipants: number
): Array<{ rank: number; percentage: number; payout: number }> {
  if (payoutStructure === 'winner-take-all') {
    return [{ rank: 1, percentage: 100, payout: totalPot }]
  }

  if (payoutStructure === 'top-3' && numParticipants >= 3) {
    return [
      { rank: 1, percentage: 60, payout: totalPot * 0.60 },
      { rank: 2, percentage: 25, payout: totalPot * 0.25 },
      { rank: 3, percentage: 15, payout: totalPot * 0.15 }
    ]
  }

  if (payoutStructure === 'top-5' && numParticipants >= 5) {
    return [
      { rank: 1, percentage: 40, payout: totalPot * 0.40 },
      { rank: 2, percentage: 25, payout: totalPot * 0.25 },
      { rank: 3, percentage: 15, payout: totalPot * 0.15 },
      { rank: 4, percentage: 12, payout: totalPot * 0.12 },
      { rank: 5, percentage: 8, payout: totalPot * 0.08 }
    ]
  }

  return [{ rank: 1, percentage: 100, payout: totalPot }]
}

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

  const totalPot = group.bettingSettings.entryFee * memberIds.length
  const payoutTiers = calculateTieredPayouts(
    totalPot,
    group.bettingSettings.payoutStructure,
    standings.length
  )

  const winnerPayouts = payoutTiers.map(tier => ({
    userId: standings[tier.rank - 1].userId,
    username: standings[tier.rank - 1].username,
    avatar: standings[tier.rank - 1].avatar,
    rank: tier.rank,
    payout: tier.payout,
    percentage: tier.percentage
  }))

  const winnerIds = new Set(winnerPayouts.map(w => w.userId))
  const amountOwed = group.bettingSettings.entryFee

  const period: BettingPeriod = {
    id: `${group.id}-${periodType}-${Date.now()}`,
    groupId: group.id,
    type: periodType,
    startDate: Date.now(),
    endDate: Date.now(),
    winnerId: standings[0].userId,
    winnerUsername: standings[0].username,
    winnerAvatar: standings[0].avatar,
    totalPot,
    payout: payoutTiers[0].payout,
    payoutStatus: 'pending',
    winnerPayouts,
    standings: standings.map((s, idx) => ({
      ...s,
      rank: idx + 1,
      amountOwed: winnerIds.has(s.userId) ? 0 : amountOwed
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

  const memberIds = group.memberIds
  const totalPot = group.bettingSettings.entryFee * memberIds.length
  const payoutTiers = calculateTieredPayouts(
    totalPot,
    group.bettingSettings.payoutStructure,
    leaderboard.length
  )

  const winnerPayouts = payoutTiers.map(tier => ({
    userId: leaderboard[tier.rank - 1].userId,
    username: leaderboard[tier.rank - 1].username,
    avatar: leaderboard[tier.rank - 1].avatar,
    rank: tier.rank,
    payout: tier.payout,
    percentage: tier.percentage
  }))

  const winnerIds = new Set(winnerPayouts.map(w => w.userId))
  const amountOwed = group.bettingSettings.entryFee

  const period: BettingPeriod = {
    id: `${group.id}-${periodType}-${Date.now()}`,
    groupId: group.id,
    gameId: leaderboard[0].gameId,
    type: periodType,
    startDate: Date.now(),
    endDate: Date.now(),
    winnerId: leaderboard[0].userId,
    winnerUsername: leaderboard[0].username,
    winnerAvatar: leaderboard[0].avatar,
    totalPot,
    payout: payoutTiers[0].payout,
    payoutStatus: 'pending',
    winnerPayouts,
    standings: leaderboard.map((entry, idx) => ({
      userId: entry.userId,
      username: entry.username,
      avatar: entry.avatar,
      returnPercent: entry.totalReturnPercent,
      returnValue: entry.totalReturnValue,
      rank: idx + 1,
      amountOwed: winnerIds.has(entry.userId) ? 0 : amountOwed
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

export function recordBettingHistory(
  period: BettingPeriod,
  group: Group
): BettingHistoryEntry[] {
  const entries: BettingHistoryEntry[] = []
  const winnerPayouts = period.winnerPayouts || []
  const winnerPayoutMap = new Map(winnerPayouts.map(w => [w.userId, w.payout]))

  period.standings.forEach((standing, idx) => {
    const wonAmount = winnerPayoutMap.get(standing.userId) || 0
    const lostAmount = wonAmount > 0 ? 0 : (standing.amountOwed || 0)

    entries.push({
      id: `${period.id}-${standing.userId}`,
      userId: standing.userId,
      groupId: group.id,
      groupName: group.name,
      periodId: period.id,
      periodType: period.type,
      timestamp: period.endDate,
      rank: standing.rank || (idx + 1),
      totalParticipants: period.standings.length,
      amountWon: wonAmount > 0 ? wonAmount : undefined,
      amountLost: lostAmount > 0 ? lostAmount : undefined,
      returnPercent: standing.returnPercent,
      returnValue: standing.returnValue
    })
  })

  return entries
}

export function calculateUserBettingStats(
  userId: string,
  bettingHistory: BettingHistoryEntry[],
  allGroups: Record<string, Group>
): UserBettingStats {
  const userHistory = bettingHistory.filter(h => h.userId === userId)

  let totalWinnings = 0
  let totalLosses = 0
  let gamesWon = 0
  let totalRank = 0

  const byPeriodType = {
    weekly: { wins: 0, losses: 0, net: 0 },
    monthly: { wins: 0, losses: 0, net: 0 },
    season: { wins: 0, losses: 0, net: 0 }
  }

  const byGroup: Record<string, {
    groupName: string
    wins: number
    losses: number
    net: number
    gamesPlayed: number
  }> = {}

  let bestRank = Infinity

  userHistory.forEach(entry => {
    const won = entry.amountWon || 0
    const lost = entry.amountLost || 0

    totalWinnings += won
    totalLosses += lost
    totalRank += entry.rank

    if (won > 0) gamesWon++
    if (entry.rank < bestRank) bestRank = entry.rank

    byPeriodType[entry.periodType].wins += won
    byPeriodType[entry.periodType].losses += lost
    byPeriodType[entry.periodType].net += (won - lost)

    if (!byGroup[entry.groupId]) {
      byGroup[entry.groupId] = {
        groupName: entry.groupName,
        wins: 0,
        losses: 0,
        net: 0,
        gamesPlayed: 0
      }
    }

    byGroup[entry.groupId].wins += won
    byGroup[entry.groupId].losses += lost
    byGroup[entry.groupId].net += (won - lost)
    byGroup[entry.groupId].gamesPlayed++
  })

  return {
    totalWinnings,
    totalLosses,
    netProfit: totalWinnings - totalLosses,
    totalGames: userHistory.length,
    gamesWon,
    winRate: userHistory.length > 0 ? (gamesWon / userHistory.length) * 100 : 0,
    averageRank: userHistory.length > 0 ? totalRank / userHistory.length : 0,
    bestRank: bestRank === Infinity ? 0 : bestRank,
    byPeriodType,
    byGroup,
    history: userHistory.sort((a, b) => b.timestamp - a.timestamp)
  }
}
