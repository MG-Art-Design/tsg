import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendUp, TrendDown, Lightning, Trophy, ChartLine } from '@phosphor-icons/react'
import { Portfolio, Asset, InsiderTrade, UserProfile } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { motion } from 'framer-motion'
import { InsiderTrades } from './InsiderTrades'
import { StrategicInsightsEnhanced } from './StrategicInsightsEnhanced'
import { generateMockInsiderTrades } from '@/lib/insiderHelpers'
import { AnimatedPortfolioCounter } from './AnimatedPortfolioCounter'

interface DashboardProps {
  portfolio: Portfolio | null
  marketData: Asset[]
  userProfile: UserProfile
  onUpgradeClick: () => void
}

export function Dashboard({ portfolio, marketData, userProfile, onUpgradeClick }: DashboardProps) {
  const topGainers = [...marketData].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h).slice(0, 3)
  const topLosers = [...marketData].sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h).slice(0, 3)
  
  const [insiderTrades, setInsiderTrades] = useState<InsiderTrade[]>([])
  const previousValueRef = useRef(portfolio?.currentValue || 10000)

  useEffect(() => {
    if (portfolio?.currentValue && portfolio.currentValue !== previousValueRef.current) {
      previousValueRef.current = portfolio.currentValue
    }
  }, [portfolio?.currentValue])

  useEffect(() => {
    const initialTrades = generateMockInsiderTrades()
    setInsiderTrades(initialTrades)

    const interval = setInterval(() => {
      const updatedTrades = generateMockInsiderTrades()
      setInsiderTrades(updatedTrades)
    }, 43200000)

    return () => clearInterval(interval)
  }, [])

  const userTier = userProfile.subscription?.tier || 'free'

  if (!portfolio || portfolio.positions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
          <CardContent className="pt-12 pb-12">
            <div className="text-center max-w-2xl mx-auto">
              <Lightning size={64} weight="duotone" className="mx-auto mb-6 text-primary opacity-60" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Welcome to TSG: The Stonk Game!</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                You've got {formatCurrency(10000)} burning a hole in your virtual pocket. Time to build your first portfolio and show everyone what you're made of.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Pick your stocks, choose your cryptos, and may the odds be ever in your favor. Head to the <strong>Edit</strong> tab to get started.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendUp size={18} weight="bold" className="text-success sm:w-5 sm:h-5" />
                Top Movers Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topGainers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-success font-medium flex items-center gap-1 justify-end">
                      <TrendUp size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendDown size={18} weight="bold" className="text-destructive sm:w-5 sm:h-5" />
                Biggest Drops Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLosers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-destructive font-medium flex items-center gap-1 justify-end">
                      <TrendDown size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <InsiderTrades trades={insiderTrades} userTier={userTier} onUpgradeClick={onUpgradeClick} />

        <StrategicInsightsEnhanced trades={insiderTrades} userTier={userTier} onUpgradeClick={onUpgradeClick} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {portfolio && (
        <AnimatedPortfolioCounter
          currentValue={portfolio.currentValue}
          previousValue={previousValueRef.current}
          totalReturn={portfolio.totalReturn}
          totalReturnPercent={portfolio.totalReturnPercent}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Lightning size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
                <span className="truncate">Active Positions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {portfolio?.positions.length || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {portfolio ? 'Positions held' : 'Build your portfolio'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Trophy size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
                <span className="truncate">Quarter Rank</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                --
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Compete for #1
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendUp size={18} weight="bold" className="text-success sm:w-5 sm:h-5" />
                Top Movers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topGainers.map((asset, i) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-success font-medium flex items-center gap-1 justify-end">
                      <TrendUp size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-[oklch(0.70_0.14_75)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendDown size={18} weight="bold" className="text-destructive sm:w-5 sm:h-5" />
                Biggest Drops
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLosers.map((asset, i) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                    <div className="text-sm text-destructive font-medium flex items-center gap-1 justify-end">
                      <TrendDown size={14} weight="bold" />
                      {formatPercent(asset.priceChangePercent24h)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <InsiderTrades trades={insiderTrades} userTier={userTier} onUpgradeClick={onUpgradeClick} />

      <StrategicInsightsEnhanced trades={insiderTrades} userTier={userTier} onUpgradeClick={onUpgradeClick} />

      {portfolio?.positions.length > 0 && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)]">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Your Top Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.positions.slice(0, 5).map((position, i) => (
                <motion.div
                  key={position.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-[oklch(0.70_0.14_75)]/30"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={position.type === 'crypto' ? 'default' : 'secondary'}>
                      {position.type === 'crypto' ? '₿' : '$'}
                    </Badge>
                    <div>
                      <div className="font-semibold">{position.symbol}</div>
                      <div className="text-sm text-muted-foreground">{position.allocation}% allocation</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(position.value)}</div>
                    <div className={`text-sm font-medium ${position.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(position.returnPercent)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
