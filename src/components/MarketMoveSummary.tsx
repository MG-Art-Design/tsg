import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartLineUp, 
  ArrowsClockwise,
  CheckCircle,
  TrendUp,
  TrendDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MarketMove {
  title: string
  description: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
}

interface MarketSummaryData {
  moves: MarketMove[]
  generatedAt: number
  date: number
}

export function MarketMoveSummary() {
  const [marketSummary, setMarketSummary] = useKV<MarketSummaryData | null>('market-move-summary', null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const checkAndGenerate = async () => {
      if (!marketSummary) {
        await generateMarketSummary()
      } else {
        const now = Date.now()
        const eightHours = 8 * 60 * 60 * 1000
        if (now - marketSummary.generatedAt > eightHours) {
          await generateMarketSummary()
        }
      }
    }
    checkAndGenerate()
  }, [])

  const generateMarketSummary = async () => {
    setIsGenerating(true)

    try {
      const promptText = `You are a financial analyst providing a concise market summary based on the latest 8 hours of trading activity.

Generate EXACTLY 10 bullet points summarizing the key market moves across:
- Major stock market indices (S&P 500, NASDAQ, Dow Jones)
- Notable individual stock movements (tech, finance, energy, consumer, healthcare sectors)
- Cryptocurrency markets (Bitcoin, Ethereum, other major altcoins)
- Significant Wall Street developments and institutional moves
- Market sentiment indicators and trends

Requirements:
- EXACTLY 10 bullet points, no more, no less
- Each bullet must be 1-2 sentences maximum
- Focus on the most impactful moves from the last 8 hours of trading
- Include specific percentage changes or price movements where relevant
- Mix of stocks and crypto updates
- Indicate sentiment for each move (bullish/bearish/neutral)
- Use professional yet accessible language
- Be specific with company names, tickers, and numbers

Return ONLY valid JSON in this exact format:
{
  "moves": [
    {
      "title": "Brief headline (5-8 words max)",
      "description": "One or two sentences with specific details and numbers",
      "sentiment": "bullish|bearish|neutral"
    }
  ]
}

Ensure the array contains EXACTLY 10 moves.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const data = JSON.parse(response)

      if (!data.moves || data.moves.length !== 10) {
        throw new Error('Expected exactly 10 market moves')
      }

      const newSummary: MarketSummaryData = {
        moves: data.moves,
        generatedAt: Date.now(),
        date: Date.now()
      }

      setMarketSummary(() => newSummary)

      toast.success('Market summary updated!', {
        description: 'Latest 8-hour trading floor and crypto activity loaded.'
      })

    } catch (error) {
      console.error('Failed to generate market summary:', error)
      toast.error('Generation failed', {
        description: 'Could not fetch market data. Try again in a moment.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getTimeSinceUpdate = () => {
    if (!marketSummary) return ''
    const hours = Math.floor((Date.now() - marketSummary.generatedAt) / (60 * 60 * 1000))
    const minutes = Math.floor((Date.now() - marketSummary.generatedAt) / (60 * 1000)) % 60
    if (hours === 0) return `${minutes}m ago`
    return `${hours}h ${minutes}m ago`
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendUp size={14} weight="bold" className="text-[oklch(0.70_0.12_145)]" />
      case 'bearish':
        return <TrendDown size={14} weight="bold" className="text-[oklch(0.58_0.18_25)]" />
      default:
        return <CheckCircle size={14} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'border-[oklch(0.70_0.12_145_/_0.4)] text-[oklch(0.70_0.12_145)] bg-[oklch(0.70_0.12_145_/_0.15)]'
      case 'bearish':
        return 'border-[oklch(0.58_0.18_25_/_0.4)] text-[oklch(0.58_0.18_25)] bg-[oklch(0.58_0.18_25_/_0.15)]'
      default:
        return 'border-[oklch(0.70_0.14_75_/_0.4)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.70_0.14_75_/_0.15)]'
    }
  }

  return (
    <Card className="border-2 border-[oklch(0.70_0.14_75)]">
      <CardHeader className="pb-4 border-b border-[oklch(0.70_0.14_75_/_0.3)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.70_0.14_75_/_0.2)] border border-[oklch(0.70_0.14_75_/_0.5)]">
              <ChartLineUp size={20} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-lg font-playfair text-[oklch(0.70_0.14_75)]">
                Market Moves: Last 8 Hours
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Key developments from Wall Street and crypto markets
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            onClick={generateMarketSummary}
            disabled={isGenerating}
            variant="outline"
            className="border-[oklch(0.70_0.14_75_/_0.5)] text-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.70_0.14_75_/_0.15)]"
          >
            {isGenerating ? (
              <>
                <ArrowsClockwise size={14} className="animate-spin" />
                <span className="hidden sm:inline ml-2">Updating...</span>
              </>
            ) : (
              <>
                <ArrowsClockwise size={14} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {isGenerating && !marketSummary && (
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
                <ChartLineUp size={64} weight="fill" className="mx-auto mb-4 text-[oklch(0.70_0.14_75)]" />
              </motion.div>
              <p className="text-foreground font-medium mb-2">
                Fetching latest market data...
              </p>
              <p className="text-sm text-muted-foreground">
                Analyzing trading floor and crypto activity
              </p>
            </motion.div>
          )}

          {marketSummary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  variant="outline"
                  className="border-[oklch(0.70_0.14_75_/_0.5)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.70_0.14_75_/_0.15)]"
                >
                  <CheckCircle size={12} weight="fill" className="mr-1" />
                  Updated {getTimeSinceUpdate()}
                </Badge>
              </div>

              <div className="space-y-3">
                {marketSummary.moves.map((move, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex gap-3 p-4 rounded-lg bg-card border border-border hover:border-[oklch(0.70_0.14_75_/_0.5)] transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSentimentColor(move.sentiment)}`}>
                        {getSentimentIcon(move.sentiment)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {move.title}
                        </h4>
                        <Badge 
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${getSentimentColor(move.sentiment)}`}
                        >
                          {move.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {move.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(marketSummary.generatedAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
