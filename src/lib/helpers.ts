import { Asset, QuarterData, InsiderTrade } from './types'

export function getCurrentQuarter(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  if (month >= 0 && month <= 2) return `Q1-${year}`
  if (month >= 3 && month <= 5) return `Q2-${year}`
  if (month >= 6 && month <= 8) return `Q3-${year}`
  return `Q4-${year}`
}

export function getQuarterData(quarter: string): QuarterData {
  const [q, year] = quarter.split('-')
  const yearNum = parseInt(year)
  
  const quarters = {
    Q1: { start: new Date(yearNum, 0, 1), end: new Date(yearNum, 2, 31) },
    Q2: { start: new Date(yearNum, 3, 1), end: new Date(yearNum, 5, 30) },
    Q3: { start: new Date(yearNum, 6, 1), end: new Date(yearNum, 8, 30) },
    Q4: { start: new Date(yearNum, 9, 1), end: new Date(yearNum, 11, 31) },
  }
  
  const { start, end } = quarters[q as keyof typeof quarters]
  const now = Date.now()
  
  return {
    quarter,
    startDate: start.getTime(),
    endDate: end.getTime(),
    isActive: now >= start.getTime() && now <= end.getTime(),
  }
}

export function generateMockMarketData(): Asset[] {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'JPM', name: 'JPMorgan Chase' },
  ]
  
  const crypto = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
  ]
  
  const baseStockPrice = 150
  const baseCryptoPrice = 40000
  
  return [
    ...stocks.map(s => ({
      ...s,
      type: 'stock' as const,
      currentPrice: baseStockPrice * (0.5 + Math.random() * 3),
      priceChange24h: (Math.random() - 0.5) * 20,
      priceChangePercent24h: (Math.random() - 0.5) * 8,
    })),
    ...crypto.map(c => ({
      ...c,
      type: 'crypto' as const,
      currentPrice: baseCryptoPrice * (0.01 + Math.random() * 2),
      priceChange24h: (Math.random() - 0.5) * 2000,
      priceChangePercent24h: (Math.random() - 0.5) * 12,
    })),
  ]
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return formatCurrency(value)
}

export function getRandomAvatar(): string {
  const avatars = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓']
  return avatars[Math.floor(Math.random() * avatars.length)]
}

export const INITIAL_PORTFOLIO_VALUE = 10000

export function calculatePortfolioValue(
  positions: Array<{ allocation: number; currentPrice: number; entryPrice: number }>,
  initialValue: number = INITIAL_PORTFOLIO_VALUE
): { currentValue: number; totalReturn: number; totalReturnPercent: number } {
  const currentValue = positions.reduce((sum, pos) => {
    const shares = (pos.allocation / 100) * initialValue / pos.entryPrice
    return sum + shares * pos.currentPrice
  }, 0)
  
  const totalReturn = currentValue - initialValue
  const totalReturnPercent = (totalReturn / initialValue) * 100
  
  return { currentValue, totalReturn, totalReturnPercent }
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function cleanupOldMessages<T extends { timestamp: number }>(
  messages: T[],
  maxAgeMs: number = 90 * 24 * 60 * 60 * 1000
): T[] {
  const cutoffTime = Date.now() - maxAgeMs
  return messages.filter(msg => msg.timestamp > cutoffTime)
}

export function formatMessageTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

import { SubscriptionTier, SubscriptionFeatures } from './types'

export const SUBSCRIPTION_PRICING = {
  free: { monthly: 0, annual: 0 },
  premium: { monthly: 9.99, annual: 99 }
}

export function getSubscriptionFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  if (tier === 'premium') {
    return {
      strategicInsights: true,
      groupChat: true,
      emailNotifications: true,
      maxGroups: -1,
      historicalData: true,
      advancedAnalytics: true,
      prioritySupport: true
    }
  }

  return {
    strategicInsights: false,
    groupChat: false,
    emailNotifications: false,
    maxGroups: 1,
    historicalData: false,
    advancedAnalytics: false,
    prioritySupport: false
  }
}

export function isSubscriptionActive(endDate?: number): boolean {
  if (!endDate) return false
  return Date.now() < endDate
}

export function getSubscriptionDaysRemaining(endDate?: number): number {
  if (!endDate) return 0
  const remaining = endDate - Date.now()
  return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)))
}

export function calculateSubscriptionEndDate(months: number = 1): number {
  const now = new Date()
  now.setMonth(now.getMonth() + months)
  return now.getTime()
}
