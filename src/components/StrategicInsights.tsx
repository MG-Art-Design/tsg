import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InsiderTrade, SubscriptionTier } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkle, TrendUp, Warning, Target, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface StrategicInsightsProps {
  trades: InsiderTrade[]
  userTier: SubscriptionTier
  onUpgradeClick: () => void
}

interface GeneratedInsight {
  id: string
  title: string
  content: string
  signals: string[]
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
  relevantTrades: string[]
  timestamp: number
}

export function StrategicInsights({ trades, userTier, onUpgradeClick }: StrategicInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [insight, setInsight] = useState<GeneratedInsight | null>(null)

  if (userTier !== 'premium') {
    return (
      <Card className="border-2 border-[var(--insider-gold)]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--insider-bg)]/60 to-transparent backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-[var(--insider-bg)] rounded-full border-2 border-[var(--insider-gold)]">
                <Brain size={32} weight="fill" className="text-[var(--insider-gold)]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--insider-gold)] mb-2">Premium Feature</h3>
              <p className="text-sm text-foreground/80 max-w-sm">
                Unlock AI-powered strategic insights that analyze insider trading patterns and generate actionable intelligence for your portfolio.
              </p>
            </div>
            <Button
              onClick={onUpgradeClick}
              size="lg"
              className="bg-[var(--insider-gold)] text-[var(--insider-bg)] hover:bg-[var(--insider-gold-glow)] font-semibold shadow-lg"
            >
              <Brain size={20} weight="fill" className="mr-2" />
              Upgrade to Access
            </Button>
          </div>
        </div>
        <div className="blur-sm pointer-events-none select-none opacity-40">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Brain size={22} weight="fill" className="text-[var(--insider-gold)]" />
              Strategic Positioning AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sample insight content...
            </p>
          </CardContent>
        </div>
      </Card>
    )
  }

  const generateStrategicInsight = async () => {
    if (trades.length === 0) {
      toast.error('No insider trades available', {
        description: 'Wait for the next data refresh to generate insights.'
      })
      return
    }

    setIsGenerating(true)

    try {
      const recentTrades = trades.slice(0, 10)
      
      const tradesSummary = recentTrades.map(t => 
        `${t.trader} (${t.category}) ${t.action} ${t.amount} of ${t.asset} worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(t.value)}`
      ).join('\n')

      const buyPatterns = recentTrades.filter(t => t.action === 'buy')
      const sellPatterns = recentTrades.filter(t => t.action === 'sell')
      
      const assetFrequency = recentTrades.reduce((acc, t) => {
        acc[t.asset] = (acc[t.asset] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const hotAssets = Object.entries(assetFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([asset]) => asset)

      const promptText = `You are a sassy, bold market analyst for "TSG: The Stonk Game" who specializes in reading insider trading patterns. Based on the following recent insider trades, generate a strategic market insight with hypothesized future moves.

Recent Insider Trades:
${tradesSummary}

Analysis Context:
- ${buyPatterns.length} recent BUY signals vs ${sellPatterns.length} SELL signals
- Hot assets with multiple trades: ${hotAssets.join(', ')}
- Mix of Congress (${recentTrades.filter(t => t.category === 'congress').length}), White House (${recentTrades.filter(t => t.category === 'whitehouse').length}), and Trump Family (${recentTrades.filter(t => t.category === 'trump-family').length}) trades

Generate a strategic insight that:
1. Has a bold, attention-grabbing title (8-12 words)
2. Provides 2-3 paragraphs of analysis with personality (sassy but smart)
3. Lists 3-5 specific market signals to watch
4. Hypothesizes 2-3 strategic positioning moves
5. Assigns a risk level (low/medium/high) and confidence score (60-95%)

Be bold, be strategic, but also acknowledge uncertainty. Use phrases like "the smart money is flowing toward...", "insiders are positioning for...", "this could signal...". Make it engaging and actionable.

Return ONLY valid JSON in this exact format:
{
  "title": "Strategic insight title here",
  "analysis": "Full analysis text with multiple paragraphs separated by \\n\\n",
  "signals": ["Signal 1", "Signal 2", "Signal 3"],
  "hypothesizedMoves": ["Move 1", "Move 2"],
  "riskLevel": "medium",
  "confidence": 78
}`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const data = JSON.parse(response)

      const newInsight: GeneratedInsight = {
        id: Date.now().toString(),
        title: data.title,
        content: data.analysis,
        signals: [...data.signals, ...data.hypothesizedMoves.map((m: string) => `Strategy: ${m}`)],
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        relevantTrades: recentTrades.map(t => t.id),
        timestamp: Date.now()
      }

      setInsight(newInsight)
      toast.success('Strategic insight generated!', {
        description: 'AI has analyzed recent insider trading patterns.'
      })
    } catch (error) {
      console.error('Failed to generate insight:', error)
      toast.error('Failed to generate insight', {
        description: 'Something went wrong. Try again in a moment.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-[oklch(0.70_0.12_145)] border-[oklch(0.70_0.12_145_/_0.4)] bg-[oklch(0.70_0.12_145_/_0.15)]'
      case 'medium':
        return 'text-[oklch(0.70_0.14_75)] border-[oklch(0.70_0.14_75_/_0.4)] bg-[oklch(0.70_0.14_75_/_0.15)]'
      case 'high':
        return 'text-[oklch(0.58_0.18_25)] border-[oklch(0.58_0.18_25_/_0.4)] bg-[oklch(0.58_0.18_25_/_0.15)]'
      default:
        return ''
    }
  }

  return (
    <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.5)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)]">
      <CardHeader className="border-b border-[oklch(0.65_0.12_75_/_0.3)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Brain size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-playfair text-[oklch(0.70_0.14_75)]">
              Strategic Positioning AI
            </CardTitle>
          </div>
          <Button
            onClick={generateStrategicInsight}
            disabled={isGenerating || trades.length === 0}
            size="sm"
            className="bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border border-[oklch(0.70_0.14_75)] shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all"
          >
            {isGenerating ? (
              <>
                <Sparkle size={16} weight="fill" className="animate-spin" />
                <span className="hidden sm:inline ml-2">Analyzing...</span>
              </>
            ) : (
              <>
                <Lightbulb size={16} weight="fill" />
                <span className="hidden sm:inline ml-2">Generate Insight</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-[oklch(0.60_0.10_75)] mt-2">
          AI-powered analysis of insider trading patterns with hypothesized future market moves
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {!insight && !isGenerating && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Brain size={64} weight="fill" className="mx-auto mb-4 text-[oklch(0.65_0.12_75_/_0.3)]" />
              <p className="text-[oklch(0.60_0.10_75)] mb-2">
                Ready to analyze {trades.length} insider trades
              </p>
              <p className="text-sm text-[oklch(0.50_0.08_75)]">
                Click "Generate Insight" to get AI-powered strategic positioning analysis
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
                Analyzing insider trading patterns...
              </p>
              <p className="text-sm text-[oklch(0.60_0.10_75)]">
                Crunching the numbers, reading the tea leaves, channeling the vibes
              </p>
            </motion.div>
          )}

          {insight && !isGenerating && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-[oklch(0.75_0.14_75)] leading-tight">
                    {insight.title}
                  </h3>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Badge variant="outline" className={getRiskColor(insight.riskLevel)}>
                      {insight.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.65_0.12_75_/_0.15)]"
                    >
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  {insight.content.split('\n\n').map((paragraph, i) => (
                    <p 
                      key={i} 
                      className="text-[oklch(0.65_0.10_75)] leading-relaxed mb-4 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                  <Target size={18} weight="fill" />
                  <h4 className="font-semibold">Key Signals & Strategic Moves</h4>
                </div>
                <div className="grid gap-2">
                  {insight.signals.map((signal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.2)]"
                    >
                      {signal.startsWith('Strategy:') ? (
                        <TrendUp size={18} weight="bold" className="text-[oklch(0.70_0.14_75)] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Warning size={18} weight="fill" className="text-[oklch(0.70_0.14_75)] flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm text-[oklch(0.65_0.10_75)]">
                        {signal.replace('Strategy: ', '')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[oklch(0.65_0.12_75_/_0.2)] flex items-center justify-between">
                <p className="text-xs text-[oklch(0.50_0.08_75)]">
                  Based on {insight.relevantTrades.length} recent insider trades • Generated {new Date(insight.timestamp).toLocaleTimeString()}
                </p>
                <Button
                  onClick={generateStrategicInsight}
                  variant="outline"
                  size="sm"
                  className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                >
                  <Sparkle size={14} weight="fill" />
                  <span className="hidden sm:inline ml-2">Refresh</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
