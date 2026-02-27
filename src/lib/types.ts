export interface UserProfile {
  id: string
  username: string
  avatar: string
  bio: string
  insightFrequency: 'daily' | 'weekly' | 'monthly'
  createdAt: number
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
