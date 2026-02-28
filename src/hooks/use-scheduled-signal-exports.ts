import { useEffect, useRef } from 'react'
import { SignalExportConfig } from '@/lib/signalHelpers'

interface ScheduleCheckResult {
  shouldTrigger: boolean
  type: 'daily' | 'weekly' | 'monthly' | null
}

function checkSchedule(config: SignalExportConfig): ScheduleCheckResult {
  if (!config.automaticLeaderboardUpdates?.enabled) {
    return { shouldTrigger: false, type: null }
  }

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentDay = now.getDay()
  const currentDate = now.getDate()

  const { daily, dailyTime, weekly, weeklyDay, weeklyTime, monthly, monthlyDay, monthlyTime } = config.automaticLeaderboardUpdates

  if (daily && dailyTime) {
    const [targetHour, targetMinute] = dailyTime.split(':').map(Number)
    if (currentHour === targetHour && currentMinute === targetMinute) {
      return { shouldTrigger: true, type: 'daily' }
    }
  }

  if (weekly && weeklyDay && weeklyTime) {
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    }
    const targetDay = dayMap[weeklyDay]
    const [targetHour, targetMinute] = weeklyTime.split(':').map(Number)
    
    if (currentDay === targetDay && currentHour === targetHour && currentMinute === targetMinute) {
      return { shouldTrigger: true, type: 'weekly' }
    }
  }

  if (monthly && monthlyDay && monthlyTime) {
    const [targetHour, targetMinute] = monthlyTime.split(':').map(Number)
    
    if (currentDate === monthlyDay && currentHour === targetHour && currentMinute === targetMinute) {
      return { shouldTrigger: true, type: 'monthly' }
    }
  }

  return { shouldTrigger: false, type: null }
}

export function useScheduledSignalExports(
  config: SignalExportConfig | null,
  onTrigger: (type: 'daily' | 'weekly' | 'monthly') => void
) {
  const lastCheckRef = useRef<string>('')

  useEffect(() => {
    if (!config?.automaticLeaderboardUpdates?.enabled) return

    const interval = setInterval(() => {
      const now = new Date()
      const currentTimeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
      
      if (lastCheckRef.current === currentTimeKey) {
        return
      }

      lastCheckRef.current = currentTimeKey
      
      const result = checkSchedule(config)
      if (result.shouldTrigger && result.type) {
        onTrigger(result.type)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [config, onTrigger])
}
