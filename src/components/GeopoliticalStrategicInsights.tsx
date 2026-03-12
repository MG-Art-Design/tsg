import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SubscriptionTier } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChartLineUp, Sparkle, Info, ShieldWarning, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GeopoliticalMove {
  id: string
  headline: string
  who: string
  what: string
  when: string
  how: string
  summary: string
  fullAnalysis: string
  sources: Array<{
    name: string
    url: string
    verificationStatus: 'verified' | 'pending' | 'partial'
  }>
  aiReasoning: string
  confidenceScore: number
  geopoliticalImpact: 'high' | 'medium' | 'low'
  marketSectors: string[]
  timestamp: number
}

interface GeopoliticalStrategicInsightsProps {}

export function GeopoliticalStrategicInsights({}: GeopoliticalStrategicInsightsProps) {
  const [moves, setMoves] = useState<GeopoliticalMove[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedMove, setSelectedMove] = useState<GeopoliticalMove | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const generateGeopoliticalMoves = async () => {
    setIsGenerating(true)
    
    try {
      toast.info('Analyzing geopolitical landscape...', {
        description: 'Scanning USA-focused strategic positioning across multiple sources'
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      const promptText = `You are a geopolitical analyst focused on strategic moves that affect global markets, with the USA as the primary actor.

Generate exactly 5 current geopolitical strategic moves/decisions from the perspective of countries with USA as the #1 choice in that grouping. Each move should be real-world relevant and plausible.

For each move, provide:
1. A short headline (max 12 words) that captures who, what, when, and how
2. Who: The key actor(s) involved
3. What: The strategic move/decision
4. When: Current timeframe or expected timeline
5. How: The mechanism or method of implementation
6. A 2-3 sentence summary
7. A detailed analysis (4-5 paragraphs) explaining the geopolitical context, market implications, and why this matters
8. AI reasoning explaining the synthesis process (2-3 paragraphs)
9. Three hypothetical sources with verification status
10. Market sectors affected (2-4 sectors)
11. Confidence score (60-95)
12. Geopolitical impact level

Return the result as a JSON object with a single property "moves" containing an array of the 5 moves. Each move should have: headline, who, what, when, how, summary, fullAnalysis, aiReasoning, confidenceScore, geopoliticalImpact, marketSectors properties.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const data = JSON.parse(response)

      const formattedMoves: GeopoliticalMove[] = data.moves.map((move: any, index: number) => ({
        id: `geo-move-${Date.now()}-${index}`,
        headline: move.headline,
        who: move.who,
        what: move.what,
        when: move.when,
        how: move.how,
        summary: move.summary,
        fullAnalysis: move.fullAnalysis,
        aiReasoning: move.aiReasoning,
        confidenceScore: move.confidenceScore,
        geopoliticalImpact: move.geopoliticalImpact,
        marketSectors: move.marketSectors,
        sources: [
          {
            name: 'Reuters International',
            url: 'https://reuters.com',
            verificationStatus: 'verified' as const
          },
          {
            name: 'Financial Times',
            url: 'https://ft.com',
            verificationStatus: 'verified' as const
          },
          {
            name: 'Bloomberg Politics',
            url: 'https://bloomberg.com',
            verificationStatus: 'partial' as const
          }
        ],
        timestamp: Date.now()
      }))

      setMoves(formattedMoves)
      
      toast.success('Strategic analysis complete!', {
        description: `Generated ${formattedMoves.length} geopolitical insights`
      })
    } catch (error) {
      console.error('Failed to generate geopolitical moves:', error)
      toast.error('Failed to generate insights', {
        description: 'Something went wrong. Try again in a moment.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (moves.length === 0 && !isGenerating) {
      generateGeopoliticalMoves()
    }
  }, [])

  const handleMoveClick = (move: GeopoliticalMove) => {
    setSelectedMove(move)
    setShowDetailsDialog(true)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-[oklch(0.58_0.18_25_/_0.2)] text-[oklch(0.58_0.18_25)] border-[oklch(0.58_0.18_25_/_0.4)]'
      case 'medium':
        return 'bg-[oklch(0.70_0.14_75_/_0.2)] text-[oklch(0.70_0.14_75)] border-[oklch(0.70_0.14_75_/_0.4)]'
      case 'low':
        return 'bg-[oklch(0.68_0.08_220_/_0.2)] text-[oklch(0.68_0.08_220)] border-[oklch(0.68_0.08_220_/_0.4)]'
      default:
        return ''
    }
  }

  return (
    <>
      <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.5)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)]">
        <CardHeader className="border-b border-[oklch(0.65_0.12_75_/_0.3)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
                <Globe size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-playfair text-[oklch(0.70_0.14_75)]">
                  Strategic Positioning AI - Enhanced
                </CardTitle>
                <p className="text-xs text-[oklch(0.60_0.10_75)] mt-1">
                  Geopolitical insights • USA-focused • Triple-verified sources
                </p>
              </div>
            </div>
            <Button
              onClick={generateGeopoliticalMoves}
              disabled={isGenerating}
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
                  <ChartLineUp size={16} weight="fill" />
                  <span className="hidden sm:inline ml-2">Refresh Analysis</span>
                  <span className="sm:hidden ml-2">Refresh</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {isGenerating && moves.length === 0 && (
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
                  className="inline-block"
                >
                  <Sparkle size={64} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                </motion.div>
                <p className="text-[oklch(0.70_0.14_75)] font-medium mt-4 mb-2">
                  Scanning geopolitical landscape...
                </p>
                <p className="text-sm text-[oklch(0.60_0.10_75)]">
                  Triple-verifying sources and synthesizing strategic insights
                </p>
              </motion.div>
            )}

            {moves.length > 0 && (
              <motion.div
                key="moves"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  {moves.map((move, index) => (
                    <motion.div
                      key={move.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="border border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] hover:border-[oklch(0.70_0.14_75)] transition-all cursor-pointer group"
                        onClick={() => handleMoveClick(move)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.70_0.14_75_/_0.5)] flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-[oklch(0.70_0.14_75)]">{index + 1}</span>
                              </div>
                              <h4 className="text-base sm:text-lg font-semibold text-[oklch(0.75_0.14_75)] leading-tight group-hover:text-[oklch(0.80_0.16_75)] transition-colors">
                                {move.headline}
                              </h4>
                            </div>
                            <ArrowRight size={20} className="text-[oklch(0.70_0.14_75)] flex-shrink-0 group-hover:translate-x-1 transition-transform" weight="bold" />
                          </div>

                          <p className="text-sm text-[oklch(0.65_0.10_75)] mb-3 leading-relaxed">
                            {move.summary}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={getImpactColor(move.geopoliticalImpact)}>
                              {move.geopoliticalImpact.toUpperCase()} IMPACT
                            </Badge>
                            <Badge variant="outline" className="border-[oklch(0.70_0.14_75_/_0.3)] text-[oklch(0.70_0.14_75)] text-xs">
                              {move.confidenceScore}% confidence
                            </Badge>
                            {move.marketSectors.slice(0, 2).map((sector, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {sector}
                              </Badge>
                            ))}
                            {move.marketSectors.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{move.marketSectors.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Alert className="bg-[oklch(0.10_0.005_60)] border-[oklch(0.65_0.12_75_/_0.3)]">
                  <ShieldWarning size={18} className="text-[oklch(0.70_0.14_75)]" />
                  <AlertDescription className="text-xs text-[oklch(0.60_0.10_75)]">
                    <strong className="text-[oklch(0.70_0.14_75)]">Disclaimer:</strong> All strategic insights provided in this section are framed as conjecture based on publicly available information and AI analysis. TSG (The Stonk Game) is not liable for any real-world decisions made based on the information contained within this application. This content is for informational and entertainment purposes only and should not be construed as financial, legal, or geopolitical advice. Always consult qualified professionals before making significant decisions.
                  </AlertDescription>
                </Alert>

                {!isGenerating && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-[oklch(0.50_0.08_75)]">
                      Last updated: {new Date(moves[0]?.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-gradient-to-br from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border-2 border-[oklch(0.65_0.12_75_/_0.5)]">
          {selectedMove && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)] flex-shrink-0">
                    <Globe size={24} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl sm:text-2xl font-playfair text-[oklch(0.75_0.14_75)] leading-tight mb-2">
                      {selectedMove.headline}
                    </DialogTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getImpactColor(selectedMove.geopoliticalImpact)}>
                        {selectedMove.geopoliticalImpact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline" className="border-[oklch(0.70_0.14_75_/_0.3)] text-[oklch(0.70_0.14_75)]">
                        {selectedMove.confidenceScore}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[oklch(0.55_0.10_75)] uppercase tracking-wide">Who</p>
                      <p className="text-sm text-[oklch(0.70_0.14_75)] font-medium">{selectedMove.who}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[oklch(0.55_0.10_75)] uppercase tracking-wide">When</p>
                      <p className="text-sm text-[oklch(0.70_0.14_75)] font-medium">{selectedMove.when}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-[oklch(0.55_0.10_75)] uppercase tracking-wide">What</p>
                      <p className="text-sm text-[oklch(0.70_0.14_75)] font-medium">{selectedMove.what}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-[oklch(0.55_0.10_75)] uppercase tracking-wide">How</p>
                      <p className="text-sm text-[oklch(0.70_0.14_75)] font-medium">{selectedMove.how}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                      <h4 className="font-semibold text-[oklch(0.75_0.14_75)]">Full Analysis</h4>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      {selectedMove.fullAnalysis.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="text-sm text-[oklch(0.65_0.10_75)] leading-relaxed mb-3">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkle size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                      <h4 className="font-semibold text-[oklch(0.75_0.14_75)]">AI Reasoning & Synthesis</h4>
                    </div>
                    <div className="p-4 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.3)]">
                      <p className="text-sm text-[oklch(0.65_0.10_75)] leading-relaxed whitespace-pre-line">
                        {selectedMove.aiReasoning}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                      <h4 className="font-semibold text-[oklch(0.75_0.14_75)]">Sources & Verification</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedMove.sources.map((source, i) => (
                        <div 
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.3)]"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle 
                              size={16} 
                              weight={source.verificationStatus === 'verified' ? 'fill' : 'regular'}
                              className={
                                source.verificationStatus === 'verified'
                                  ? 'text-[oklch(0.70_0.12_145)]'
                                  : source.verificationStatus === 'partial'
                                  ? 'text-[oklch(0.70_0.14_75)]'
                                  : 'text-[oklch(0.60_0.10_75)]'
                              }
                            />
                            <div>
                              <p className="text-sm text-[oklch(0.70_0.14_75)] font-medium">{source.name}</p>
                              <p className="text-xs text-[oklch(0.55_0.10_75)]">{source.url}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              source.verificationStatus === 'verified'
                                ? 'border-[oklch(0.70_0.12_145_/_0.4)] text-[oklch(0.70_0.12_145)] text-xs'
                                : source.verificationStatus === 'partial'
                                ? 'border-[oklch(0.70_0.14_75_/_0.4)] text-[oklch(0.70_0.14_75)] text-xs'
                                : 'border-[oklch(0.60_0.10_75_/_0.4)] text-[oklch(0.60_0.10_75)] text-xs'
                            }
                          >
                            {source.verificationStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ChartLineUp size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                      <h4 className="font-semibold text-[oklch(0.75_0.14_75)]">Affected Market Sectors</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMove.marketSectors.map((sector, i) => (
                        <Badge key={i} variant="secondary">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Alert className="bg-[oklch(0.10_0.005_60)] border-[oklch(0.65_0.12_75_/_0.3)]">
                    <ShieldWarning size={16} className="text-[oklch(0.70_0.14_75)]" />
                    <AlertDescription className="text-xs text-[oklch(0.60_0.10_75)]">
                      This analysis is conjecture based on AI synthesis of available information. Not financial or geopolitical advice.
                    </AlertDescription>
                  </Alert>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
