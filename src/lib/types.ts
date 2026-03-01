export interface UserProfile {
  id: string
  email: string
  username: string
  avatar: string
  coverPhoto?: string
  bio: string
  insightFrequency: 'daily' | 'weekly' | 'monthly'
  emailNotifications: EmailPreferences
  createdAt: number
  groupIds: string[]
  subscription: SubscriptionStatus
  friendIds: string[]
  friendCode: string
  relationshipStatuses: Record<string, RelationshipStatus>
  notificationPreferences: NotificationPreferences
}

export type RelationshipStatus = 'friend' | 'rival' | 'mentor' | 'mentee' | 'colleague' | 'family' | 'other'

export interface RelationshipConnection {
  userId: string
  status: RelationshipStatus
  addedAt: number
}

export interface NotificationPreferences {
  relationshipChanges: boolean
  friendPortfolioUpdates: boolean
  leaderboardChanges: boolean
  groupActivity: boolean
  groupGameInvites: boolean
}

export interface EmailPreferences {
  enabled: boolean
  email: string
  frequency: 'daily' | 'weekly' | 'monthly'
  includeLeaderboard: boolean
  includeMarketPerformance: boolean
  includeInsights: boolean
  lastSent?: number
}

export interface Asset {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  currentPrice: number
  priceChange24h: number
  priceChangePercent24h: number
}

export interface PortfolioPosition {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  allocation: number
  entryPrice: number
  currentPrice: number
  shares: number
  value: number
  returnPercent: number
  returnValue: number
}

export interface Portfolio {
  id: string
  userId: string
  name: string
  quarter: string
  positions: PortfolioPosition[]
  initialValue: number
  currentValue: number
  totalReturn: number
  totalReturnPercent: number
  lastUpdated: number
  createdAt: number
  isLinkedAccount?: boolean
  linkedAccountId?: string
}

export interface Trade {
  id: string
  userId: string
  quarter: string
  timestamp: number
  positions: Array<{
    symbol: string
    allocation: number
  }>
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar: string
  returnPercent: number
  returnValue: number
  rank: number
  portfolioValue: number
}

export interface Insight {
  id: string
  userId: string
  content: string
  category: 'market-trend' | 'portfolio-tip' | 'risk-alert' | 'winner-spotlight'
  timestamp: number
  read: boolean
}

export interface QuarterData {
  quarter: string
  startDate: number
  endDate: number
  isActive: boolean
}

export interface BettingSettings {
  enabled: boolean
  entryFee: number
  weeklyPayout?: number
  monthlyPayout?: number
  seasonPayout?: number
  payoutStructure: 'winner-take-all' | 'top-3' | 'top-5'
  weeklyEnabled: boolean
  monthlyEnabled: boolean
  seasonEnabled: boolean
}

export interface BettingPeriod {
  id: string
  groupId: string
  gameId?: string
  type: 'weekly' | 'monthly' | 'season'
  startDate: number
  endDate: number
  winnerId?: string
  winnerUsername?: string
  winnerAvatar?: string
  totalPot: number
  payout: number
  payoutStatus: 'pending' | 'notified' | 'completed'
  payoutNotifiedAt?: number
  winnerPayouts?: Array<{
    userId: string
    username: string
    avatar: string
    rank: number
    payout: number
    percentage: number
  }>
  standings: Array<{
    userId: string
    username: string
    avatar: string
    returnPercent: number
    returnValue: number
    amountOwed?: number
    rank?: number
  }>
}

export interface PayoutNotification {
  id: string
  groupId: string
  periodId: string
  periodType: 'weekly' | 'monthly' | 'season'
  winnerId: string
  winnerUsername: string
  winnerAvatar: string
  winnerPaymentAccounts?: PaymentAccount[]
  totalPayout: number
  memberPayments: Array<{
    userId: string
    username: string
    avatar: string
    amountOwed: number
    paymentStatus: 'pending' | 'acknowledged'
  }>
  createdAt: number
  groupName: string
}

export interface Group {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: number
  memberIds: string[]
  inviteCode: string
  activeGameId?: string
  bettingSettings?: BettingSettings
  bettingPeriods?: BettingPeriod[]
}

export interface GroupGame {
  id: string
  groupId: string
  name: string
  startDate: number
  endDate: number
  isActive: boolean
  maxPicks: 3
  allowedTypes: ('stock' | 'crypto')[]
  createdBy: string
}

export interface GroupGamePick {
  userId: string
  gameId: string
  picks: GamePickPosition[]
  submittedAt: number
}

export interface GamePickPosition {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  entryPrice: number
  currentPrice: number
  returnPercent: number
  returnValue: number
}

export interface GroupGameLeaderboardEntry {
  userId: string
  username: string
  avatar: string
  gameId: string
  totalReturnPercent: number
  totalReturnValue: number
  picks: GamePickPosition[]
  rank: number
}

export interface GroupInvite {
  id: string
  groupId: string
  groupName: string
  invitedBy: string
  invitedByUsername: string
  invitedByAvatar: string
  invitedAt: number
  status: 'pending' | 'accepted' | 'declined'
}

export interface GroupLeaderboardEntry extends LeaderboardEntry {
  groupId: string
}

export interface ChatMessage {
  id: string
  groupId: string
  userId: string
  username: string
  avatar: string
  content: string
  timestamp: number
  reactions: MessageReaction[]
}

export interface MessageReaction {
  emoji: string
  userId: string
  username: string
  timestamp: number
}

export interface InsiderTrade {
  id: string
  trader: string
  title: string
  category: 'congress' | 'whitehouse' | 'trump-family'
  asset: string
  assetType: 'stock' | 'crypto' | 'option'
  action: 'buy' | 'sell'
  amount: string
  value: number
  disclosureDate: number
  tradeDate: number
  source: string
}

export type SubscriptionTier = 'free' | 'premium'

export interface SubscriptionStatus {
  tier: SubscriptionTier
  startDate?: number
  endDate?: number
  autoRenew: boolean
  paymentMethod?: PaymentMethod
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'crypto'
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  brand?: string
}

export interface SubscriptionFeatures {
  strategicInsights: boolean
  groupChat: boolean
  emailNotifications: boolean
  maxGroups: number
  maxPortfolios: number
  historicalData: boolean
  advancedAnalytics: boolean
  prioritySupport: boolean
}

export interface ActivityEvent {
  id: string
  userId: string
  type: 'portfolio_created' | 'portfolio_updated' | 'game_pick_submitted' | 'game_pick_updated' | 'friend_added' | 'group_joined' | 'game_completed' | 'rank_changed' | 'milestone_reached'
  timestamp: number
  quarter?: string
  gameId?: string
  data: Record<string, any>
  metadata?: {
    positions?: PortfolioPosition[]
    picks?: GamePickPosition[]
    oldRank?: number
    newRank?: number
    performanceChange?: number
  }
}

export interface ActivityHistoryEntry {
  id: string
  userId: string
  quarter: string
  events: ActivityEvent[]
  summary?: string
  quarterStartValue: number
  quarterEndValue: number
  totalReturn: number
  totalReturnPercent: number
  generatedAt?: number
}

export interface GameActivityLog {
  id: string
  gameId: string
  userId: string
  events: ActivityEvent[]
  summary?: string
  finalRank?: number
  totalReturn?: number
  generatedAt?: number
}

export interface SharingPreferences {
  shareWithFriends: boolean
  shareWithGroups: string[]
  shareActivityHistory: boolean
  shareGameSummaries: boolean
  sharePerformanceMetrics: boolean
}

export interface DataRetentionSettings {
  keepPortfolioHistoryIndefinitely: boolean
  consentGiven: boolean
  consentGivenAt?: number
  allowAutomaticDeletion: boolean
  retentionPeriodDays?: number
}

export interface PaymentAccount {
  type: 'venmo' | 'zelle'
  qrCodeDataUrl?: string
  accountIdentifier?: string
}

export interface BettingHistoryEntry {
  id: string
  userId: string
  groupId: string
  groupName: string
  periodId: string
  periodType: 'weekly' | 'monthly' | 'season'
  timestamp: number
  rank: number
  totalParticipants: number
  amountWon?: number
  amountLost?: number
  returnPercent: number
  returnValue: number
}

export interface UserBettingStats {
  totalWinnings: number
  totalLosses: number
  netProfit: number
  totalGames: number
  gamesWon: number
  winRate: number
  averageRank: number
  bestRank: number
  byPeriodType: {
    weekly: { wins: number; losses: number; net: number }
    monthly: { wins: number; losses: number; net: number }
    season: { wins: number; losses: number; net: number }
  }
  byGroup: Record<string, {
    groupName: string
    wins: number
    losses: number
    net: number
    gamesPlayed: number
  }>
  history: BettingHistoryEntry[]
}

export interface LinkedTradingAccount {
  id: string
  platform: 'robinhood' | 'sofi' | 'webull' | 'etrade' | 'fidelity' | 'tdameritrade' | 'other'
  accountName: string
  linkedAt: number
  lastSyncedAt?: number
  isActive: boolean
  currentValue?: number
  totalReturn?: number
  totalReturnPercent?: number
}

export interface ImportedPosition {
  symbol: string
  name: string
  type: 'stock' | 'crypto' | 'option'
  quantity: number
  averageCost: number
  currentPrice: number
  marketValue: number
  totalReturn: number
  totalReturnPercent: number
  importedFrom: string
  lastUpdated: number
}

export interface OptionsHistory {
  id: string
  symbol: string
  type: 'call' | 'put'
  strikePrice: number
  expirationDate: number
  action: 'buy' | 'sell'
  contracts: number
  premium: number
  totalCost: number
  status: 'open' | 'closed' | 'expired' | 'exercised'
  openedAt: number
  closedAt?: number
  profit?: number
  profitPercent?: number
  importedFrom: string
}

export interface DailyInsiderRecommendation {
  id: string
  date: number
  positions: {
    symbol: string
    name: string
    type: 'stock' | 'crypto'
    action: 'buy' | 'sell' | 'hold'
    allocation: number
    reasoning: string
    confidence: number
    expectedReturn: string
    timeHorizon: '1-week' | '2-week' | '1-month' | '3-month'
  }[]
  marketSummary: string
  insiderActivity: string
  riskAssessment: string
  generatedAt: number
}

export interface UserProfile {
  id: string
  email: string
  username: string
  avatar: string
  coverPhoto?: string
  bio: string
  insightFrequency: 'daily' | 'weekly' | 'monthly'
  emailNotifications: EmailPreferences
  createdAt: number
  groupIds: string[]
  subscription: SubscriptionStatus
  friendIds: string[]
  friendCode: string
  relationshipStatuses: Record<string, RelationshipStatus>
  notificationPreferences: NotificationPreferences
  sharingPreferences?: SharingPreferences
  dataRetentionSettings?: DataRetentionSettings
  paymentAccounts?: PaymentAccount[]
  bettingHistory?: BettingHistoryEntry[]
  linkedAccounts?: LinkedTradingAccount[]
  importedPositions?: ImportedPosition[]
  optionsHistory?: OptionsHistory[]
}
