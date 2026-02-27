export interface UserProfile {
  id: string
  username: string
  avatar: string
  bio: string
  insightFrequency: 'daily' | 'weekly' | 'monthly'
  emailNotifications: EmailPreferences
  createdAt: number
  groupIds: string[]
  subscription: SubscriptionStatus
  friendIds: string[]
  friendCode: string
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
  userId: string
  quarter: string
  positions: PortfolioPosition[]
  initialValue: number
  currentValue: number
  totalReturn: number
  totalReturnPercent: number
  lastUpdated: number
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

export interface Group {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: number
  memberIds: string[]
  inviteCode: string
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
  historicalData: boolean
  advancedAnalytics: boolean
  prioritySupport: boolean
}
