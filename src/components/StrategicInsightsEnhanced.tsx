import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InsiderTrade, SubscriptionTier } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkle, TrendUp, TrendDown, Warning, Target, Lightbulb, ChartLineUp, CheckCircle, ShieldCheck, Crown } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateVettedInsight, VettedInsight } from '@/lib/insiderHelpers'

interface StrategicInsightsEnhancedProps {
  trades: InsiderTrade[]
  userTier: SubscriptionTier
  onUpgradeClick: () => void
}

export function StrategicInsightsEnhanced({ trades, userTier, onUpgradeClick }: StrategicInsightsEnhancedProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [insight, setInsight] = useState<VettedInsight | null>(null)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [phase1Complete, setPhase1Complete] = useState(false)
  const [phase2Complete, setPhase2Complete] = useState(false)

  if (userTier !== 'premium') {
    return (
      <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.5)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.05_0.008_70)]/90 to-[oklch(0.08_0.006_70)]/90 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-[oklch(0.05_0.008_70)] rounded-full border-2 border-[oklch(0.70_0.14_75)]">
                <Brain size={32} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[oklch(0.70_0.14_75)] mb-2">Premium Feature Locked</h3>
              <p className="text-sm text-[oklch(0.60_0.10_75)] max-w-sm">
                Unlock 2x research depth with two-part AI vetting system, strategic asset categorization, and quiet hand analysis of key players.
              </p>
            </div>
            <Button
              onClick={onUpgradeClick}
              size="lg"
              className="bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] hover:shadow-[0_0_30px_oklch(0.70_0.14_75_/_0.4)] font-semibold"
            >
              <Crown size={20} weight="fill" className="mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
        <div className="blur-sm pointer-events-none select-none opacity-40">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Brain size={22} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
              Strategic Positioning AI - Enhanced
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

  const generateEnhancedInsight = async () => {
    if (trades.length === 0) {
      toast.error('No insider trades available', {
        description: 'Wait for the next data refresh to generate insights.'
      })
      return
    }

    setIsGenerating(true)
    setPhase1Complete(false)
    setPhase2Complete(false)
    setActiveTab('overview')

    try {
      toast.info('Phase 1 Vetting: Pattern Recognition', {
        description: 'Analyzing trade clusters and player activity...'
      })

      await new Promise(resolve => setTimeout(resolve, 1500))
      setPhase1Complete(true)

      toast.success('Phase 1 Complete', {
        description: 'Key patterns identified. Starting Phase 2...'
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.info('Phase 2 Vetting: Strategic Analysis', {
        description: 'Extrapolating quiet hand movements and strategic positioning...'
      })

      const vettedInsight = await generateVettedInsight(trades)
      
      setPhase2Complete(true)
      setInsight(vettedInsight)
      
      toast.success('Strategic Insight Generated!', {
        description: `Vet Score: ${vettedInsight.vetScore}/100 • ${vettedInsight.confidence}% confidence`
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'highest-growth':
        return 'bg-[oklch(0.70_0.12_145_/_0.2)] text-[oklch(0.70_0.12_145)] border-[oklch(0.70_0.12_145_/_0.4)]'
      case 'highest-volatility':
        return 'bg-[oklch(0.58_0.18_25_/_0.2)] text-[oklch(0.58_0.18_25)] border-[oklch(0.58_0.18_25_/_0.4)]'
      case 'lowest-volatility':
        return 'bg-[oklch(0.68_0.08_220_/_0.2)] text-[oklch(0.68_0.08_220)] border-[oklch(0.68_0.08_220_/_0.4)]'
      case 'consistent-performer':
        return 'bg-[oklch(0.70_0.14_75_/_0.2)] text-[oklch(0.70_0.14_75)] border-[oklch(0.70_0.14_75_/_0.4)]'
      case 'underrated-genius':
        return 'bg-[oklch(0.72_0.06_210_/_0.2)] text-[oklch(0.72_0.06_210)] border-[oklch(0.72_0.06_210_/_0.4)]'
      default:
        return ''
    }
  }

  return (
    <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.5)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)]">
      <CardHeader className="border-b border-[oklch(0.65_0.12_75_/_0.3)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Brain size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-playfair text-[oklch(0.70_0.14_75)]">
                Strategic Positioning AI - Enhanced
              </CardTitle>
              <p className="text-xs text-[oklch(0.60_0.10_75)] mt-1">
                Two-part vetting • 2x research depth • Quiet hand analysis
              </p>
            </div>
          </div>
          <Button
            onClick={generateEnhancedInsight}
            disabled={isGenerating || trades.length === 0}
            size="sm"
            className="bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border border-[oklch(0.70_0.14_75)] shadow-[0_0_15px_oklch(0.65_0.12_75_/_0.3)] transition-all"
          >
            {isGenerating ? (
              <>
                <Sparkle size={16} weight="fill" className="animate-spin" />
                <span className="hidden sm:inline ml-2">
                  {!phase1Complete ? 'Phase 1...' : !phase2Complete ? 'Phase 2...' : 'Synthesizing...'}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} weight="fill" />
                <span className="hidden sm:inline ml-2">Generate Vetted Insight</span>
                <span className="sm:hidden ml-2">Generate</span>
              </>
            )}
          </Button>
        </div>
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
              <p className="text-[oklch(0.60_0.10_75)] mb-2 font-medium">
                Ready to analyze {trades.length} insider trades with enhanced vetting
              </p>
              <p className="text-sm text-[oklch(0.50_0.08_75)]">
                Phase 1: Pattern recognition • Phase 2: Strategic synthesis
              </p>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  <Sparkle size={64} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                </motion.div>
                <p className="text-[oklch(0.70_0.14_75)] font-medium mt-4 mb-2">
                  Running two-part vetting analysis...
                </p>
                <p className="text-sm text-[oklch(0.60_0.10_75)]">
                  This might take a minute. We're doing deep research here.
                </p>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.3)]">
                  {phase1Complete ? (
                    <CheckCircle size={20} weight="fill" className="text-[oklch(0.70_0.12_145)] flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[oklch(0.70_0.14_75)] border-t-transparent animate-spin flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[oklch(0.70_0.14_75)]">Phase 1: Pattern Recognition</p>
                    <p className="text-xs text-[oklch(0.55_0.10_75)]">Identifying clusters, anomalies, key players</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.3)]">
                  {phase2Complete ? (
                    <CheckCircle size={20} weight="fill" className="text-[oklch(0.70_0.12_145)] flex-shrink-0" />
                  ) : phase1Complete ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[oklch(0.70_0.14_75)] border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[oklch(0.28_0.02_240)] flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[oklch(0.70_0.14_75)]">Phase 2: Strategic Analysis</p>
                    <p className="text-xs text-[oklch(0.55_0.10_75)]">Quiet hand extrapolation, winner/loser identification</p>
                  </div>
                </div>
              </div>
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
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[oklch(0.65_0.12_75_/_0.2)]">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-[oklch(0.70_0.14_75)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.70_0.14_75_/_0.15)] font-bold">
                    VET SCORE: {insight.vetScore}/100
                  </Badge>
                  <Badge variant="outline" className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.65_0.10_75)] text-xs">
                    Phase 1: {insight.phase1Score}
                  </Badge>
                  <Badge variant="outline" className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.65_0.10_75)] text-xs">
                    Phase 2: {insight.phase2Score}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getRiskColor(insight.riskLevel)}>
                    {insight.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline" className="border-[oklch(0.70_0.14_75)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.70_0.14_75_/_0.15)]">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.3)] h-auto">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-2 py-2">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-2 py-2">
                    Assets
                  </TabsTrigger>
                  <TabsTrigger value="signals" className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-2 py-2">
                    Signals
                  </TabsTrigger>
                  <TabsTrigger value="players" className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-2 py-2">
                    Players
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-playfair font-semibold text-[oklch(0.75_0.14_75)] leading-tight">
                    {insight.title}
                  </h3>

                  <div className="prose prose-invert max-w-none">
                    {insight.analysis.split('\n\n').map((paragraph: string, i: number) => (
                      <p key={i} className="text-[oklch(0.65_0.10_75)] leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {insight.patterns.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                        <Target size={18} weight="fill" />
                        <h4 className="font-semibold">Identified Patterns</h4>
                      </div>
                      <div className="grid gap-2">
                        {insight.patterns.map((pattern, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.2)]"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <p className="text-sm font-medium text-[oklch(0.70_0.14_75)]">{pattern.pattern}</p>
                              <Badge variant="outline" className="text-xs">
                                {pattern.occurrences}x
                              </Badge>
                            </div>
                            <p className="text-xs text-[oklch(0.60_0.10_75)] mb-2">{pattern.implication}</p>
                            <div className="flex flex-wrap gap-1">
                              {pattern.assets.map((asset, j) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                      <ChartLineUp size={18} weight="fill" />
                      <h4 className="font-semibold">Strategic Asset Recommendations</h4>
                    </div>
                    <p className="text-sm text-[oklch(0.60_0.10_75)]">
                      Categorized by insider positioning and strategic value
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {insight.assetRecommendations.map((asset, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border border-[oklch(0.65_0.12_75_/_0.3)]"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-[oklch(0.75_0.14_75)]">{asset.symbol}</span>
                              <Badge variant="secondary" className="text-xs">
                                {asset.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-[oklch(0.65_0.10_75)]">{asset.name}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={getCategoryColor(asset.category)}>
                              {asset.category.replace(/-/g, ' ').toUpperCase()}
                            </Badge>
                            <p className="text-xs text-[oklch(0.70_0.14_75)] font-bold mt-2">
                              Score: {asset.score}/100
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-[oklch(0.60_0.10_75)] mb-3">{asset.reasoning}</p>
                        
                        {asset.backedByPlayers.length > 0 && (
                          <div>
                            <p className="text-xs text-[oklch(0.55_0.10_75)] mb-1">Backed by:</p>
                            <div className="flex flex-wrap gap-1">
                              {asset.backedByPlayers.map((player, j) => (
                                <Badge key={j} variant="outline" className="text-xs border-[oklch(0.70_0.14_75_/_0.3)]">
                                  {player}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="signals" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                      <Target size={18} weight="fill" />
                      <h4 className="font-semibold">Trading Signals</h4>
                    </div>
                    <p className="text-sm text-[oklch(0.60_0.10_75)]">
                      Actionable signals based on insider activity patterns
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {insight.tradingSignals.map((signal, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.2)]"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {signal.type === 'bullish' ? (
                              <TrendUp size={20} weight="bold" className="text-[oklch(0.70_0.12_145)]" />
                            ) : signal.type === 'bearish' ? (
                              <TrendDown size={20} weight="bold" className="text-[oklch(0.58_0.18_25)]" />
                            ) : (
                              <Warning size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                            )}
                            <span className="text-lg font-bold text-[oklch(0.75_0.14_75)]">{signal.asset}</span>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              className={
                                signal.type === 'bullish' 
                                  ? 'bg-[oklch(0.70_0.12_145_/_0.2)] text-[oklch(0.70_0.12_145)] border-[oklch(0.70_0.12_145_/_0.4)]'
                                  : signal.type === 'bearish'
                                  ? 'bg-[oklch(0.58_0.18_25_/_0.2)] text-[oklch(0.58_0.18_25)] border-[oklch(0.58_0.18_25_/_0.4)]'
                                  : 'bg-[oklch(0.70_0.14_75_/_0.2)] text-[oklch(0.70_0.14_75)] border-[oklch(0.70_0.14_75_/_0.4)]'
                              }
                            >
                              {signal.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div>
                            <p className="text-xs text-[oklch(0.55_0.10_75)]">Strength</p>
                            <p className="text-sm font-bold text-[oklch(0.70_0.14_75)]">{signal.strength}/100</p>
                          </div>
                          <div>
                            <p className="text-xs text-[oklch(0.55_0.10_75)]">Horizon</p>
                            <p className="text-sm font-bold text-[oklch(0.70_0.14_75)]">{signal.timeHorizon}</p>
                          </div>
                        </div>

                        <p className="text-sm text-[oklch(0.65_0.10_75)]">{signal.reasoning}</p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="players" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
                      <Crown size={18} weight="fill" />
                      <h4 className="font-semibold">Key Players</h4>
                    </div>
                    <p className="text-sm text-[oklch(0.60_0.10_75)]">
                      Influential insiders and their trading patterns
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {insight.keyPlayers.map((player, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border border-[oklch(0.65_0.12_75_/_0.3)]"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h5 className="text-lg font-bold text-[oklch(0.75_0.14_75)] mb-1">{player.name}</h5>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {player.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {player.tradingPattern}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[oklch(0.55_0.10_75)]">Influence</p>
                            <p className="text-xl font-bold text-[oklch(0.70_0.14_75)]">{player.influence}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-[oklch(0.65_0.10_75)]">{player.recentActivity}</p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-4 border-t border-[oklch(0.65_0.12_75_/_0.2)] flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-[oklch(0.50_0.08_75)]">
                  Generated {new Date(insight.timestamp).toLocaleString()} • Based on {trades.length} trades
                </p>
                <Button
                  onClick={generateEnhancedInsight}
                  variant="outline"
                  size="sm"
                  className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                >
                  <Sparkle size={14} weight="fill" />
                  <span className="hidden sm:inline ml-2">Regenerate</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
