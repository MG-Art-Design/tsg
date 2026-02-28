import { useKV } from '@github/spark/hooks'
import { ActivityEvent, ActivityHistoryEntry, GameActivityLog } from '@/lib/types'
import { getCurrentQuarter } from '@/lib/helpers'

export function useActivityTracker(userId: string) {
  const [activityHistory, setActivityHistory] = useKV<Record<string, ActivityHistoryEntry>>('activity-history', {})
  const [, setGameActivityLogs] = useKV<Record<string, GameActivityLog>>('game-activity-logs', {})

  const recordEvent = (event: Omit<ActivityEvent, 'id' | 'userId' | 'timestamp'>) => {
    const fullEvent: ActivityEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: Date.now()
    }

    const quarter = event.quarter || getCurrentQuarter()
    const historyKey = `${userId}-${quarter}`

    setActivityHistory(current => {
      const existing = current?.[historyKey] || {
        id: historyKey,
        userId,
        quarter,
        events: [],
        quarterStartValue: 0,
        quarterEndValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0
      }

      return {
        ...(current || {}),
        [historyKey]: {
          ...existing,
          events: [...existing.events, fullEvent]
        }
      }
    })
  }

  const recordGameEvent = (gameId: string, event: Omit<ActivityEvent, 'id' | 'userId' | 'timestamp'>) => {
    const fullEvent: ActivityEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: Date.now(),
      gameId
    }

    const logKey = `${userId}-${gameId}`

    setGameActivityLogs(current => {
      const existing = current?.[logKey] || {
        id: logKey,
        gameId,
        userId,
        events: []
      }

      return {
        ...(current || {}),
        [logKey]: {
          ...existing,
          events: [...existing.events, fullEvent]
        }
      }
    })
  }

  const updateQuarterSummary = (quarter: string, portfolioValue: number, initialValue: number) => {
    const historyKey = `${userId}-${quarter}`
    
    setActivityHistory(current => {
      const existing = current?.[historyKey]
      if (!existing) return current || {}

      const totalReturn = portfolioValue - initialValue
      const totalReturnPercent = ((portfolioValue - initialValue) / initialValue) * 100

      return {
        ...(current || {}),
        [historyKey]: {
          ...existing,
          quarterStartValue: initialValue,
          quarterEndValue: portfolioValue,
          totalReturn,
          totalReturnPercent
        }
      }
    })
  }

  const updateGameSummary = (gameId: string, finalRank: number, totalReturn: number) => {
    const logKey = `${userId}-${gameId}`

    setGameActivityLogs(current => {
      const existing = current?.[logKey]
      if (!existing) return current || {}

      return {
        ...(current || {}),
        [logKey]: {
          ...existing,
          finalRank,
          totalReturn
        }
      }
    })
  }

  return {
    recordEvent,
    recordGameEvent,
    updateQuarterSummary,
    updateGameSummary
  }
}
