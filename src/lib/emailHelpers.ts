import { UserProfile, Portfolio, LeaderboardEntry, Insight, EmailPreferences } from './types'
import { formatCurrency, formatPercent, getCurrentQuarter } from './helpers'

export function shouldSendEmail(
  frequency: 'daily' | 'weekly' | 'monthly',
  lastSent?: number
): boolean {
  if (!lastSent) return true

  const now = Date.now()
  const timeSinceLastSent = now - lastSent

  const intervals = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  }

  return timeSinceLastSent >= intervals[frequency]
}

interface EmailContentData {
  profile: UserProfile
  portfolio: Portfolio
  leaderboardEntries: LeaderboardEntry[]
  insights: Insight[]
  preferences: EmailPreferences
}

export function generateEmailContent(data: EmailContentData): {
  subject: string
  htmlContent: string
  textContent: string
} {
  const { profile, portfolio, leaderboardEntries, insights, preferences } = data
  const quarter = getCurrentQuarter()
  const frequencyLabel = preferences.frequency.charAt(0).toUpperCase() + preferences.frequency.slice(1)

  const subject = `TSG ${frequencyLabel} Update: ${portfolio.totalReturn >= 0 ? '📈' : '📉'} ${formatPercent(portfolio.totalReturnPercent)}`

  const sections: string[] = []
  const textSections: string[] = []

  sections.push(`
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #1a1d29; color: #e8e9f3; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-family: 'Georgia', serif; font-size: 36px; font-weight: 700; color: #b4c5ff; margin: 0;">TSG</h1>
        <p style="font-family: 'Georgia', serif; font-size: 14px; color: #8893b8; margin: 5px 0 0 0;">The Stonk Game • ${quarter}</p>
      </div>
  `)

  textSections.push(`TSG: The Stonk Game - ${frequencyLabel} Update\n${quarter}\n\n`)

  sections.push(`
      <div style="background: #23263a; border-left: 4px solid #b4c5ff; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
        <h2 style="font-family: 'Georgia', serif; font-size: 20px; margin: 0 0 10px 0; color: #e8e9f3;">Hey ${profile.username} ${profile.avatar}</h2>
        <p style="font-family: 'Georgia', serif; line-height: 1.6; color: #c7cbd9; margin: 0;">
          Here's your ${preferences.frequency} performance update. ${
            portfolio.totalReturn >= 0
              ? "Looking sharp! Keep that momentum going."
              : "Rough patch, but hey, even legends have their off days. Bounce back time!"
          }
        </p>
      </div>
  `)

  textSections.push(`Hey ${profile.username} ${profile.avatar}\n\nHere's your ${preferences.frequency} performance update.\n\n`)

  if (preferences.includeMarketPerformance && portfolio) {
    const returnDirection = portfolio.totalReturn >= 0 ? 'UP' : 'DOWN'
    const emoji = portfolio.totalReturn >= 0 ? '🚀' : '📉'

    sections.push(`
      <div style="margin-bottom: 30px;">
        <h3 style="font-family: 'Georgia', serif; font-size: 18px; color: #b4c5ff; margin: 0 0 15px 0;">Portfolio Performance ${emoji}</h3>
        <div style="background: #23263a; padding: 20px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #8893b8;">Current Value:</span>
            <span style="font-weight: 600; color: #e8e9f3;">${formatCurrency(portfolio.currentValue)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #8893b8;">Total Return:</span>
            <span style="font-weight: 600; color: ${portfolio.totalReturn >= 0 ? '#b0dfb7' : '#f28b82'};">
              ${formatCurrency(portfolio.totalReturn)} (${formatPercent(portfolio.totalReturnPercent)})
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #8893b8;">Direction:</span>
            <span style="font-weight: 700; color: ${portfolio.totalReturn >= 0 ? '#b0dfb7' : '#f28b82'};">${returnDirection}</span>
          </div>
        </div>
      </div>
    `)

    textSections.push(`Portfolio Performance ${emoji}\n`)
    textSections.push(`Current Value: ${formatCurrency(portfolio.currentValue)}\n`)
    textSections.push(`Total Return: ${formatCurrency(portfolio.totalReturn)} (${formatPercent(portfolio.totalReturnPercent)})\n`)
    textSections.push(`Direction: ${returnDirection}\n\n`)

    if (portfolio.positions.length > 0) {
      sections.push(`
        <div style="margin-bottom: 30px;">
          <h4 style="font-family: 'Georgia', serif; font-size: 16px; color: #b4c5ff; margin: 0 0 12px 0;">Top Positions</h4>
          <div style="background: #23263a; padding: 15px; border-radius: 8px;">
      `)

      const topPositions = [...portfolio.positions]
        .sort((a, b) => Math.abs(b.returnPercent) - Math.abs(a.returnPercent))
        .slice(0, 3)

      textSections.push(`Top Positions:\n`)

      topPositions.forEach((pos, index) => {
        const isLast = index === topPositions.length - 1
        sections.push(`
          <div style="padding: 8px 0; ${!isLast ? 'border-bottom: 1px solid #2e3245;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 600; color: #e8e9f3;">${pos.symbol}</span>
                <span style="color: #8893b8; font-size: 14px; margin-left: 8px;">${pos.name}</span>
              </div>
              <span style="font-weight: 600; color: ${pos.returnPercent >= 0 ? '#b0dfb7' : '#f28b82'};">
                ${formatPercent(pos.returnPercent)}
              </span>
            </div>
          </div>
        `)

        textSections.push(`  ${pos.symbol} (${pos.name}): ${formatPercent(pos.returnPercent)}\n`)
      })

      sections.push(`
          </div>
        </div>
      `)

      textSections.push(`\n`)
    }
  }

  if (preferences.includeLeaderboard && leaderboardEntries.length > 0) {
    const userEntry = leaderboardEntries.find((e) => e.userId === profile.id)
    const rank = userEntry?.rank || leaderboardEntries.length

    sections.push(`
      <div style="margin-bottom: 30px;">
        <h3 style="font-family: 'Georgia', serif; font-size: 18px; color: #b4c5ff; margin: 0 0 15px 0;">Leaderboard 🏆</h3>
        <div style="background: #23263a; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #2e3245;">
            <div style="font-size: 32px; font-weight: 700; color: #b4c5ff; margin-bottom: 5px;">#{rank}</div>
            <div style="color: #8893b8; font-size: 14px;">Your Current Rank</div>
          </div>
          <div style="font-size: 14px; color: #c7cbd9;">
            ${
              rank === 1
                ? "🎉 You're crushing it! Top of the leaderboard!"
                : rank <= 3
                ? `So close! Just ${rank - 1} ${rank === 2 ? 'person' : 'people'} ahead of you.`
                : "Time to make some bold moves and climb those ranks!"
            }
          </div>
        </div>
      </div>
    `)

    textSections.push(`Leaderboard\n`)
    textSections.push(`Your Current Rank: #${rank}\n\n`)
  }

  if (preferences.includeInsights && insights.length > 0) {
    const recentInsights = insights
      .filter((i) => !i.read)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)

    if (recentInsights.length > 0) {
      sections.push(`
        <div style="margin-bottom: 30px;">
          <h3 style="font-family: 'Georgia', serif; font-size: 18px; color: #b4c5ff; margin: 0 0 15px 0;">Latest Insights 💡</h3>
      `)

      textSections.push(`Latest Insights:\n`)

      recentInsights.forEach((insight) => {
        const categoryEmojis = {
          'market-trend': '📊',
          'portfolio-tip': '💼',
          'risk-alert': '⚠️',
          'winner-spotlight': '⭐',
        }

        sections.push(`
          <div style="background: #23263a; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #8196ff;">
            <div style="font-size: 14px; color: #8893b8; margin-bottom: 5px;">
              ${categoryEmojis[insight.category]} ${insight.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </div>
            <div style="color: #e8e9f3; line-height: 1.5;">${insight.content}</div>
          </div>
        `)

        textSections.push(`  ${categoryEmojis[insight.category]} ${insight.content}\n`)
      })

      sections.push(`
        </div>
      `)

      textSections.push(`\n`)
    }
  }

  sections.push(`
      <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #2e3245;">
        <p style="color: #8893b8; font-size: 14px; margin: 0 0 10px 0;">
          Keep grinding, ${profile.username}. Fortune favors the bold.
        </p>
        <p style="color: #6b738f; font-size: 12px; margin: 0;">
          TSG: The Stonk Game • ${preferences.frequency.charAt(0).toUpperCase() + preferences.frequency.slice(1)} Update
        </p>
      </div>
    </div>
  `)

  textSections.push(`---\nKeep grinding, ${profile.username}. Fortune favors the bold.\n`)
  textSections.push(`TSG: The Stonk Game • ${preferences.frequency.charAt(0).toUpperCase() + preferences.frequency.slice(1)} Update`)

  return {
    subject,
    htmlContent: sections.join(''),
    textContent: textSections.join(''),
  }
}
