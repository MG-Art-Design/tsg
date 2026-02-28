import { ChatMessage, LeaderboardEntry, Portfolio, UserProfile } from './types'

export interface SignalExportConfig {
  groupId: string
  phoneNumber: string
  groupName: string
  enabled: boolean
  includeLeaderboardUpdates: boolean
  includeTrashTalk: boolean
  trashTalkIntensity: 'mild' | 'moderate' | 'savage'
  updateFrequency: 'instant' | 'hourly' | 'daily'
  lastExportTimestamp?: number
  automaticLeaderboardUpdates: {
    enabled: boolean
    daily: boolean
    dailyTime?: string
    weekly: boolean
    weeklyDay?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
    weeklyTime?: string
    monthly: boolean
    monthlyDay?: number
    monthlyTime?: string
  }
}

export interface SignalExportMessage {
  id: string
  groupId: string
  timestamp: number
  type: 'chat' | 'leaderboard' | 'performance' | 'trash-talk' | 'praise'
  content: string
  metadata?: {
    userId?: string
    username?: string
    changePercent?: number
    rank?: number
    action?: string
  }
}

export async function generateLeaderboardTrashTalk(
  entries: LeaderboardEntry[],
  intensity: 'mild' | 'moderate' | 'savage',
  previousEntries?: LeaderboardEntry[]
): Promise<string[]> {
  const rankChanges = previousEntries
    ? entries.map((entry, index) => {
        const prevIndex = previousEntries.findIndex(e => e.userId === entry.userId)
        const rankChange = prevIndex >= 0 ? prevIndex - index : 0
        return { ...entry, rankChange, index }
      })
    : entries.map((entry, index) => ({ ...entry, rankChange: 0, index }))

  const biggestGainer = rankChanges.reduce((max, current) => 
    current.rankChange > max.rankChange ? current : max, rankChanges[0]
  )
  const biggestLoser = rankChanges.reduce((min, current) => 
    current.rankChange < min.rankChange ? current : min, rankChanges[0]
  )

  const numMessages = intensity === 'savage' ? 3 : intensity === 'moderate' ? 2 : 1
  const focusLoser = intensity === 'savage' ? 'Mercilessly roast the last place player' : intensity === 'moderate' ? 'Playfully tease poor performers' : 'Gently poke fun at strugglers'
  const focusWinner = intensity === 'savage' ? 'Sarcastically praise the leader' : 'Congratulate top performers'
  const toneGuide = intensity === 'savage' ? 'Be brutally honest and cutting' : intensity === 'moderate' ? 'Balance sass with encouragement' : 'Keep it light and friendly'
  
  const leaderboardText = entries.map((e, i) => `${i + 1}. ${e.username}: ${e.returnPercent.toFixed(2)}% return ($${e.returnValue.toFixed(2)})`).join('\n')
  
  const rankChangeText = rankChanges.some(r => r.rankChange !== 0)
    ? `Rank Changes:\n${rankChanges.filter(r => r.rankChange !== 0).map(r => `${r.username}: ${r.rankChange > 0 ? `+${r.rankChange}` : r.rankChange} positions`).join('\n')}`
    : ''
  
  const gainerText = biggestGainer.rankChange > 0 ? `Acknowledge ${biggestGainer.username}'s climb up ${biggestGainer.rankChange} spots` : ''
  const loserText = biggestLoser.rankChange < 0 ? `Mock ${biggestLoser.username}'s fall down ${Math.abs(biggestLoser.rankChange)} spots` : ''
  
  const promptText = `You are a sarcastic, witty AI commentator for a stock trading competition game called "The Stonk Game" (TSG). Generate ${numMessages} short, punchy messages about the current leaderboard standings.

Current Leaderboard:
${leaderboardText}

${rankChangeText}

Focus on:
- ${focusLoser}
- ${focusWinner}
${gainerText ? `- ${gainerText}` : ''}
${loserText ? `- ${loserText}` : ''}

Style: 
- Keep each message under 160 characters
- Use emojis sparingly (max 2 per message)
- ${toneGuide}
- Reference actual returns and rankings
- Make it feel like competitive banter between friends

Return as a JSON object with a "messages" property containing an array of strings.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    if (parsed.messages && Array.isArray(parsed.messages)) {
      return parsed.messages.slice(0, 5)
    }
  } catch (error) {
    console.error('Failed to generate trash talk:', error)
  }

  return []
}

export async function generatePerformancePraise(
  user: UserProfile,
  portfolio: Portfolio,
  previousValue?: number
): Promise<string> {
  const changePercent = previousValue 
    ? ((portfolio.currentValue - previousValue) / previousValue) * 100
    : portfolio.totalReturnPercent

  const isPositive = changePercent > 0
  const isSignificant = Math.abs(changePercent) > 5
  
  const tone = isPositive && isSignificant ? 'Impressed but sarcastic praise' : isPositive ? 'Mild acknowledgment' : isSignificant ? 'Playful mockery' : 'Gentle teasing'

  const promptText = `You are a sarcastic AI commentator for a stock trading game. Generate ONE short, punchy message about ${user.username}'s recent performance.

Performance:
- Current Return: ${portfolio.totalReturnPercent.toFixed(2)}%
- Recent Change: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%
- Portfolio Value: $${portfolio.currentValue.toFixed(2)}
- Total Return: $${portfolio.totalReturn.toFixed(2)}

Tone: ${tone}

Keep it under 140 characters. Use max 2 emojis. Make it feel like a friend trash-talking.

Return only the message text, no JSON.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', false)
    return response.trim().replace(/^["']|["']$/g, '')
  } catch (error) {
    console.error('Failed to generate praise:', error)
    return isPositive 
      ? `${user.username} is up ${changePercent.toFixed(1)}%. Not terrible. 📈`
      : `${user.username} just lost ${Math.abs(changePercent).toFixed(1)}%. Ouch. 📉`
  }
}

export async function generateChatExportSummary(
  messages: ChatMessage[],
  maxMessages: number = 10
): Promise<string> {
  const recentMessages = messages.slice(-maxMessages)
  
  if (recentMessages.length === 0) {
    return '💬 No recent messages'
  }

  const conversationText = recentMessages.map(m => `${m.username}: ${m.content}`).join('\n')

  const promptText = `Summarize this chat conversation in one punchy sentence (max 100 chars):

${conversationText}

Keep it casual and highlight the main topic/vibe. No quotation marks.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', false)
    return response.trim().replace(/^["']|["']$/g, '')
  } catch (error) {
    console.error('Failed to generate summary:', error)
    return `💬 Latest from the group chat`
  }
}

export function formatSignalExport(
  messages: SignalExportMessage[],
  groupName: string,
  includeTimestamps: boolean = false
): string {
  const header = `📊 TSG: ${groupName}\n${'─'.repeat(30)}\n`
  
  const formattedMessages = messages.map(msg => {
    const timestamp = includeTimestamps 
      ? `[${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] `
      : ''
    
    const icon = msg.type === 'chat' ? '💬' 
      : msg.type === 'leaderboard' ? '🏆'
      : msg.type === 'performance' ? '📈'
      : msg.type === 'trash-talk' ? '💀'
      : '⭐'
    
    return `${timestamp}${icon} ${msg.content}`
  }).join('\n\n')
  
  const footer = `\n${'─'.repeat(30)}\nExported from The Stonk Game`
  
  return header + formattedMessages + footer
}

export function shouldTriggerExport(
  config: SignalExportConfig,
  lastExportTime?: number
): boolean {
  if (!config.enabled) return false
  if (!lastExportTime) return true
  
  const now = Date.now()
  const timeSinceLastExport = now - lastExportTime
  
  switch (config.updateFrequency) {
    case 'instant':
      return timeSinceLastExport > 60000
    case 'hourly':
      return timeSinceLastExport > 3600000
    case 'daily':
      return timeSinceLastExport > 86400000
    default:
      return false
  }
}

export async function generateSignalExportInstructions(
  phoneNumber: string,
  formattedExport: string
): Promise<string> {
  const sanitizedNumber = phoneNumber.replace(/\D/g, '')
  
  return `To send this to Signal:

1. Copy the message below
2. Open Signal on your phone
3. Find the group chat
4. Paste and send

Or use Signal CLI if configured:
signal-cli -u +${sanitizedNumber} send -g <groupId> -m "${formattedExport.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"

📋 Message ready to copy:`
}
