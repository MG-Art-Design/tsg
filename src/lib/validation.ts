export function validatePortfolioAllocation(allocations: Record<string, number>): {
  isValid: boolean
  total: number
  errors: string[]
} {
  const errors: string[] = []
  const total = Object.values(allocations).reduce((sum, val) => sum + val, 0)

  if (Math.abs(total - 100) > 0.01) {
    errors.push(`Total allocation is ${total.toFixed(2)}%, must equal 100%`)
  }

  Object.entries(allocations).forEach(([symbol, allocation]) => {
    if (allocation < 0) {
      errors.push(`${symbol}: Allocation cannot be negative`)
    }
    if (allocation > 100) {
      errors.push(`${symbol}: Allocation cannot exceed 100%`)
    }
  })

  return {
    isValid: errors.length === 0 && Math.abs(total - 100) < 0.01,
    total,
    errors
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateGroupName(name: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const trimmed = name.trim()

  if (trimmed.length === 0) {
    errors.push('Group name is required')
  }

  if (trimmed.length > 50) {
    errors.push('Group name must be less than 50 characters')
  }

  if (trimmed.length < 3) {
    errors.push('Group name must be at least 3 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateBettingAmount(amount: number): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (amount < 0) {
    errors.push('Betting amount cannot be negative')
  }

  if (amount === 0) {
    errors.push('Betting amount must be greater than zero')
  }

  if (amount > 10000) {
    errors.push('Betting amount cannot exceed $10,000')
  }

  if (!Number.isFinite(amount)) {
    errors.push('Invalid betting amount')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
}

export function formatInviteCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}

export function isWithinRateLimit(
  lastCallTimestamp: number | null,
  minInterval: number = 1000
): boolean {
  if (lastCallTimestamp === null) return true
  return Date.now() - lastCallTimestamp >= minInterval
}

export function calculatePayouts(
  standings: Array<{ userId: string; returnPercent: number }>,
  structure: 'winner-take-all' | 'top-3' | 'top-5',
  totalPot: number
): Array<{ userId: string; payout: number; percentage: number }> {
  const sorted = [...standings].sort((a, b) => b.returnPercent - a.returnPercent)
  
  const payouts: Array<{ userId: string; payout: number; percentage: number }> = []

  switch (structure) {
    case 'winner-take-all':
      if (sorted.length > 0) {
        payouts.push({
          userId: sorted[0].userId,
          payout: totalPot,
          percentage: 100
        })
      }
      break

    case 'top-3':
      if (sorted.length >= 1) {
        payouts.push({ userId: sorted[0].userId, payout: totalPot * 0.6, percentage: 60 })
      }
      if (sorted.length >= 2) {
        payouts.push({ userId: sorted[1].userId, payout: totalPot * 0.3, percentage: 30 })
      }
      if (sorted.length >= 3) {
        payouts.push({ userId: sorted[2].userId, payout: totalPot * 0.1, percentage: 10 })
      }
      break

    case 'top-5':
      if (sorted.length >= 1) {
        payouts.push({ userId: sorted[0].userId, payout: totalPot * 0.4, percentage: 40 })
      }
      if (sorted.length >= 2) {
        payouts.push({ userId: sorted[1].userId, payout: totalPot * 0.25, percentage: 25 })
      }
      if (sorted.length >= 3) {
        payouts.push({ userId: sorted[2].userId, payout: totalPot * 0.20, percentage: 20 })
      }
      if (sorted.length >= 4) {
        payouts.push({ userId: sorted[3].userId, payout: totalPot * 0.10, percentage: 10 })
      }
      if (sorted.length >= 5) {
        payouts.push({ userId: sorted[4].userId, payout: totalPot * 0.05, percentage: 5 })
      }
      break
  }

  return payouts
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function percentageDifference(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100
  return ((newValue - oldValue) / oldValue) * 100
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function generateRandomId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isDateToday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function daysUntilQuarterEnd(quarter: string): number {
  const [q, year] = quarter.split('-')
  const yearNum = parseInt(year)
  
  const quarters = {
    Q1: new Date(yearNum, 2, 31),
    Q2: new Date(yearNum, 5, 30),
    Q3: new Date(yearNum, 8, 30),
    Q4: new Date(yearNum, 11, 31),
  }
  
  const endDate = quarters[q as keyof typeof quarters]
  const today = new Date()
  const diff = endDate.getTime() - today.getTime()
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
