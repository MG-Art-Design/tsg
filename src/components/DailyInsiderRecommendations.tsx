import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UserProfile, DailyInsiderRecommendation, ImportedPosition, InsiderTrade } from '@/lib/types'
import { formatPercent } from '@/lib/helpers'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkle, 
  TrendUp, 
  TrendDown, 
  Target,
  Warning,
  CheckCircle,
  LockKey,
  Lightning,
  ChartLineUp,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DailyInsiderRecommendationsProps {
  profile: UserProfile
  insiderTrades: InsiderTrade[]
  onUpgradeClick?: () => void
}

export function DailyInsiderRecommendations({ 
  profile, 
  insiderTrades,
  onUpgradeClick 
}: DailyInsiderRecommendationsProps) {
  const [dailyRecs, setDailyRecs] = useKV<DailyInsiderRecommendation | null>('daily-insider-recs', null)
  const [isGenerating, setIsGenerating] = useState(false)

  const isPremium = profile.subscription.tier === 'premium'
  const hasLinkedAccounts = (profile.linkedAccounts || []).length > 0
  const importedPositions = profile.importedPositions || []

  const canAccessFeature = isPremium && hasLinkedAccounts

  const generateDailyRecommendations = async () => {
    setIsGenerating(true)

    try {
      const today = new Date().toDateString()
      if (dailyRecs && new Date(dailyRecs.date).toDateString() === today) {
        toast.info('Already generated today', {
          description: 'You already have today\'s recommendations. Check back tomorrow!'
        })
        setIsGenerating(false)
        return
      }

      const positionsContext = importedPositions.map(p => 
        `${p.symbol} (${p.type}): ${p.quantity} shares, current return ${formatPercent(p.totalReturnPercent)}`
      ).join('\n')

      const recentTrades = insiderTrades.slice(0, 15)
      const tradesContext = recentTrades.map(t =>
        `${t.trader} (${t.category}): ${t.action.toUpperCase()} ${t.asset} worth $${(t.value / 1000000).toFixed(2)}M`
      ).join('\n')

      const buyActivity = recentTrades.filter(t => t.action === 'buy')
      const sellActivity = recentTrades.filter(t => t.action === 'sell')

      const promptText = `You are "Stink" - the insider intelligence AI for TSG: The Stonk Game. Your job is to generate DAILY POSITION CHANGE RECOMMENDATIONS based on real insider trading activity.

USER'S CURRENT PORTFOLIO:
${positionsContext || 'No positions imported yet'}

RECENT INSIDER ACTIVITY (Last 7 Days):
${tradesContext}

INSIDER PATTERNS:
- ${buyActivity.length} BUY signals from insiders
- ${sellActivity.length} SELL signals from insiders
- Key players active: Congress (${recentTrades.filter(t => t.category === 'congress').length}), Trump Family (${recentTrades.filter(t => t.category === 'trump-family').length}), White House (${recentTrades.filter(t => t.category === 'whitehouse').length})

YOUR MISSION: Generate 3-5 ACTIONABLE position changes for TODAY based on:
1. Future gains potential from insider moves
2. What insiders are buying/selling RIGHT NOW
3. Alignment with or divergence from current portfolio
4. Time-sensitive opportunities (1-week to 1-month horizon)

For each recommendation:
- Specify action: BUY, SELL, or HOLD
- Provide allocation percentage (for new positions)
- Explain reasoning based on insider activity
- Assign confidence (60-95%)
- Estimate expected return and time horizon

Also provide:
- Market summary (2-3 sentences on overall market sentiment from insider lens)
- Insider activity highlights (what's hot, what's not)
- Risk assessment (what could go wrong)

TONE: Bold, confident, sassy but smart. This is "Stink: OMG It's In" energy.

Return ONLY valid JSON:
{
  "positions": [
    {
      "symbol": "TICKER",
      "name": "Full Name",
      "type": "stock|crypto",
      "action": "buy|sell|hold",
      "allocation": number (0-100, only for buy actions),
      "reasoning": "Why insiders signal this move with specific examples",
      "confidence": number (60-95),
      "expectedReturn": "descriptive range like +15-25% or -5-10%",
      "timeHorizon": "1-week|2-week|1-month|3-month"
    }
  ],
  "marketSummary": "2-3 sentence bold take on market from insider perspective",
  "insiderActivity": "What insiders are doing right now - the key moves",
  "riskAssessment": "What could derail these plays"
}`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const data = JSON.parse(response)

      const newRec: DailyInsiderRecommendation = {
        id: Date.now().toString(),
        date: Date.now(),
        positions: data.positions,
        marketSummary: data.marketSummary,
        insiderActivity: data.insiderActivity,
        riskAssessment: data.riskAssessment,
        generatedAt: Date.now()
      }

      setDailyRecs(() => newRec)

      toast.success('Daily recommendations ready!', {
        description: `Stink has analyzed ${recentTrades.length} insider trades and generated ${data.positions.length} position recommendations.`
      })

    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      toast.error('Generation failed', {
        description: 'Could not generate recommendations. Try again in a moment.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isPremium) {
    return (
      <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="ripple-container absolute inset-0">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
          </div>
        </div>
        <CardHeader className="relative z-10 pb-4 border-b border-[oklch(0.65_0.12_75_/_0.2)]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Lightning size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-playfair text-[oklch(0.70_0.14_75)]">
                  Stink: OMG It's In
                </CardTitle>
                <Badge className="bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border-0">
                  <Sparkle size={12} weight="fill" className="mr-1" />
                  Premium
                </Badge>
              </div>
              <CardDescription className="text-[oklch(0.55_0.10_75)] mt-1">
                Daily position recommendations from insider intelligence
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-6">
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-[oklch(0.65_0.12_75_/_0.15)] border-2 border-[oklch(0.65_0.12_75_/_0.5)]">
                <LockKey size={32} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-playfair font-semibold text-[oklch(0.70_0.14_75)] mb-2">
                Premium Feature Required
              </h3>
              <p className="text-sm text-[oklch(0.60_0.10_75)] max-w-md mx-auto">
                Upgrade to Premium and link your trading account to receive daily position change recommendations based on real insider trading activity.
              </p>
            </div>
            {onUpgradeClick && (
              <Button
                onClick={onUpgradeClick}
                className="bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border border-[oklch(0.70_0.14_75)]"
              >
                <Sparkle size={16} weight="fill" className="mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasLinkedAccounts) {
    return (
      <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)]">
        <CardHeader className="pb-4 border-b border-[oklch(0.65_0.12_75_/_0.2)]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Lightning size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-lg font-playfair text-[oklch(0.70_0.14_75)]">
                Stink: OMG It's In
              </CardTitle>
              <CardDescription className="text-[oklch(0.55_0.10_75)] mt-1">
                Daily position recommendations from insider intelligence
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Warning size={48} weight="fill" className="mx-auto mb-4 text-[oklch(0.70_0.14_75)] opacity-60" />
            <h3 className="text-lg font-semibold text-[oklch(0.70_0.14_75)] mb-2">
              Link a Trading Account
            </h3>
            <p className="text-sm text-[oklch(0.60_0.10_75)] max-w-md mx-auto">
              To receive personalized daily recommendations based on your portfolio, you need to link at least one trading account.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const today = new Date().toDateString()
  const isToday = dailyRecs && new Date(dailyRecs.date).toDateString() === today

  return (
    <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)]">
      <CardHeader className="pb-4 border-b border-[oklch(0.65_0.12_75_/_0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Lightning size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-lg font-playfair text-[oklch(0.70_0.14_75)]">
                Stink: OMG It's In
              </CardTitle>
              <CardDescription className="text-[oklch(0.55_0.10_75)] mt-1">
                Daily position recommendations from insider intelligence
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            onClick={generateDailyRecommendations}
            disabled={isGenerating || (isToday && dailyRecs !== null)}
            className="bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border border-[oklch(0.70_0.14_75)]"
          >
            {isGenerating ? (
              <>
                <ArrowsClockwise size={14} className="animate-spin" />
                <span className="hidden sm:inline ml-2">Generating...</span>
              </>
            ) : isToday ? (
              <>
                <CheckCircle size={14} weight="fill" />
                <span className="hidden sm:inline ml-2">Today's Recs</span>
              </>
            ) : (
              <>
                <Sparkle size={14} weight="fill" />
                <span className="hidden sm:inline ml-2">Generate Today</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {!dailyRecs && !isGenerating && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Lightning size={64} weight="fill" className="mx-auto mb-4 text-[oklch(0.65_0.12_75_/_0.3)]" />
              <p className="text-[oklch(0.60_0.10_75)] mb-2">
                Ready to analyze {insiderTrades.length} insider trades
              </p>
              <p className="text-sm text-[oklch(0.50_0.08_75)]">
                Click "Generate Today" to get your personalized position recommendations
              </p>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkle size={64} weight="fill" className="mx-auto mb-4 text-[oklch(0.70_0.14_75)]" />
              </motion.div>
              <p className="text-[oklch(0.70_0.14_75)] font-medium mb-2">
                Stink is analyzing insider activity...
              </p>
              <p className="text-sm text-[oklch(0.60_0.10_75)]">
                Crunching {insiderTrades.length} trades and your {importedPositions.length} positions
              </p>
            </motion.div>
          )}

          {dailyRecs && !isGenerating && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.65_0.12_75_/_0.15)]"
                  >
                    {new Date(dailyRecs.date).toLocaleDateString()}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="border-[oklch(0.70_0.12_145_/_0.4)] text-[oklch(0.70_0.12_145)] bg-[oklch(0.70_0.12_145_/_0.15)]"
                  >
                    <CheckCircle size={12} weight="fill" className="mr-1" />
                    Fresh
                  </Badge>
                </div>
                <p className="text-xs text-[oklch(0.50_0.08_75)]">
                  {dailyRecs.positions.length} recommendations
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[oklch(0.70_0.14_75)] mb-2 flex items-center gap-2">
                    <ChartLineUp size={16} weight="fill" />
                    Market Summary
                  </h4>
                  <p className="text-sm text-[oklch(0.65_0.10_75)] leading-relaxed">
                    {dailyRecs.marketSummary}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[oklch(0.70_0.14_75)] mb-2 flex items-center gap-2">
                    <Target size={16} weight="fill" />
                    Insider Activity
                  </h4>
                  <p className="text-sm text-[oklch(0.65_0.10_75)] leading-relaxed">
                    {dailyRecs.insiderActivity}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[oklch(0.65_0.12_75_/_0.2)]">
                <h4 className="text-sm font-semibold text-[oklch(0.70_0.14_75)] mb-4 flex items-center gap-2">
                  <Lightning size={16} weight="fill" />
                  Position Recommendations
                </h4>
                <div className="space-y-3">
                  {dailyRecs.positions.map((position, i) => (
                    <motion.div
                      key={`${position.symbol}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="p-4 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border border-[oklch(0.65_0.12_75_/_0.3)]"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            position.action === 'buy' 
                              ? 'bg-[oklch(0.70_0.12_145_/_0.2)] border border-[oklch(0.70_0.12_145_/_0.4)]'
                              : position.action === 'sell'
                              ? 'bg-[oklch(0.58_0.18_25_/_0.2)] border border-[oklch(0.58_0.18_25_/_0.4)]'
                              : 'bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.4)]'
                          }`}>
                            {position.action === 'buy' ? (
                              <TrendUp size={18} weight="bold" className="text-[oklch(0.70_0.12_145)]" />
                            ) : position.action === 'sell' ? (
                              <TrendDown size={18} weight="bold" className="text-[oklch(0.58_0.18_25)]" />
                            ) : (
                              <Target size={18} weight="bold" className="text-[oklch(0.70_0.14_75)]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-[oklch(0.70_0.14_75)]">
                                {position.symbol}
                              </h5>
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  position.action === 'buy'
                                    ? 'border-[oklch(0.70_0.12_145_/_0.4)] text-[oklch(0.70_0.12_145)] bg-[oklch(0.70_0.12_145_/_0.15)]'
                                    : position.action === 'sell'
                                    ? 'border-[oklch(0.58_0.18_25_/_0.4)] text-[oklch(0.58_0.18_25)] bg-[oklch(0.58_0.18_25_/_0.15)]'
                                    : 'border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.65_0.12_75_/_0.15)]'
                                }`}
                              >
                                {position.action.toUpperCase()}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className="text-xs border-[oklch(0.65_0.12_75_/_0.3)] text-[oklch(0.60_0.10_75)]"
                              >
                                {position.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-[oklch(0.55_0.10_75)] mb-2">
                              {position.name}
                            </p>
                            {position.action === 'buy' && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-[oklch(0.60_0.10_75)]">Allocation:</span>
                                <span className="text-sm font-semibold text-[oklch(0.70_0.14_75)]">
                                  {position.allocation}%
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-[oklch(0.65_0.10_75)] leading-relaxed">
                              {position.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[oklch(0.65_0.12_75_/_0.2)]">
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-[oklch(0.55_0.10_75)]">Expected: </span>
                            <span className="text-[oklch(0.70_0.14_75)] font-semibold">
                              {position.expectedReturn}
                            </span>
                          </div>
                          <div>
                            <span className="text-[oklch(0.55_0.10_75)]">Horizon: </span>
                            <span className="text-[oklch(0.70_0.14_75)] font-semibold">
                              {position.timeHorizon}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[oklch(0.55_0.10_75)]">Confidence:</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={position.confidence} 
                              className="w-16 h-2 bg-[oklch(0.25_0.02_240)]"
                            />
                            <span className="text-xs font-semibold text-[oklch(0.70_0.14_75)]">
                              {position.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[oklch(0.65_0.12_75_/_0.2)]">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[oklch(0.58_0.18_25_/_0.1)] border border-[oklch(0.58_0.18_25_/_0.3)]">
                  <Warning size={18} weight="fill" className="text-[oklch(0.58_0.18_25)] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-[oklch(0.58_0.18_25)] mb-1">
                      Risk Assessment
                    </h5>
                    <p className="text-xs text-[oklch(0.60_0.10_75)] leading-relaxed">
                      {dailyRecs.riskAssessment}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[oklch(0.65_0.12_75_/_0.2)] flex items-center justify-between">
                <p className="text-xs text-[oklch(0.50_0.08_75)]">
                  Generated {new Date(dailyRecs.generatedAt).toLocaleString()}
                </p>
                {!isToday && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateDailyRecommendations}
                    disabled={isGenerating}
                    className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                  >
                    <Sparkle size={12} weight="fill" />
                    <span className="hidden sm:inline ml-2">Generate Today</span>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
