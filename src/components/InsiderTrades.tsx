import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InsiderTrade } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { motion } from 'framer-motion'
import { Sparkle, TrendUp, TrendDown, Gavel, Buildings, User, LockKey } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
interface InsiderTradesProps {
  trades: InsiderTrade[]
  userTier?: 'free' | 'premium' | 'insider'
  onUpgradeClick?: () => void
}

export function InsiderTrades({ trades, userTier = 'free', onUpgradeClick }: InsiderTradesProps) {
  const [filter, setFilter] = useState<'all' | 'congress' | 'whitehouse' | 'trump-family'>('all')

  const filteredTrades = filter === 'all' 
    ? trades 
    : trades.filter(t => t.category === filter)

  const isPremium = userTier === 'premium' || userTier === 'insider'
  const visibleTrades = isPremium ? filteredTrades : filteredTrades.slice(0, 2)
  const hiddenTradesCount = filteredTrades.length - visibleTrades.length

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'congress':
        return <Gavel size={16} weight="fill" />
      case 'whitehouse':
        return <Buildings size={16} weight="fill" />
      case 'trump-family':
        return <User size={16} weight="fill" />
      default:
        return <Sparkle size={16} weight="fill" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'congress':
        return 'Congress'
      case 'whitehouse':
        return 'White House'
      case 'trump-family':
        return 'Trump Family'
      default:
        return category
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative border-[6px] border-[oklch(0.65_0.12_75)] shadow-[0_0_2px_2px_oklch(0_0_0),0_0_40px_oklch(0.65_0.12_75_/_0.3)] bg-[radial-gradient(ellipse_at_top,oklch(0.08_0.015_240),oklch(0.03_0.008_240)),radial-gradient(ellipse_at_bottom,oklch(0.05_0.012_260),oklch(0.02_0.005_240))] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="ripple-container absolute inset-0 opacity-40">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
            <div className="ripple ripple-3"></div>
          </div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,oklch(0.12_0.02_240_/_0.15)_2px,oklch(0.12_0.02_240_/_0.15)_4px)]"></div>
        </div>
        <CardHeader className="relative z-10 border-b border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-r from-[oklch(0.65_0.12_75_/_0.08)] to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)] flex-shrink-0">
                <Sparkle size={18} weight="fill" className="text-[oklch(0.70_0.14_75)] sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-xl md:text-2xl font-playfair text-[oklch(0.70_0.14_75)] flex items-center gap-2 truncate">
                  Stonk: Omg It's In
                </CardTitle>
                <p className="text-xs sm:text-sm text-[oklch(0.60_0.10_75)] mt-0.5 sm:mt-1 hidden sm:block">
                  Insider moves you need to know
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.65_0.12_75_/_0.15)] text-xs whitespace-nowrap flex-shrink-0"
            >
              <span className="hidden sm:inline">{isPremium ? `${filteredTrades.length} Trades` : `2 of ${filteredTrades.length} Trades`}</span>
              <span className="sm:hidden">{isPremium ? filteredTrades.length : `2/${filteredTrades.length}`}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.3)] h-auto">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-2 py-2"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="congress"
                className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-2 py-2"
              >
                Congress
              </TabsTrigger>
              <TabsTrigger 
                value="whitehouse"
                className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-1 sm:px-2 py-2"
              >
                <span className="hidden sm:inline">White House</span>
                <span className="sm:hidden">WH</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trump-family"
                className="data-[state=active]:bg-[oklch(0.65_0.12_75_/_0.25)] data-[state=active]:text-[oklch(0.75_0.14_75)] text-xs sm:text-sm px-1 sm:px-2 py-2"
              >
                <span className="hidden sm:inline">Trump Family</span>
                <span className="sm:hidden">Trump</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-3">
              {filteredTrades.length === 0 ? (
                <div className="text-center py-12 text-[oklch(0.55_0.10_75)]">
                  <Sparkle size={48} weight="fill" className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No trades in this category yet</p>
                </div>
              ) : (
                <>
                  {visibleTrades.map((trade, i) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border border-[oklch(0.65_0.12_75_/_0.3)] hover:border-[oklch(0.70_0.14_75_/_0.6)] transition-all hover:shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]"
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                            <Badge 
                              variant="outline"
                              className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.70_0.14_75)] bg-[oklch(0.65_0.12_75_/_0.15)] flex items-center gap-1 text-xs"
                            >
                              {getCategoryIcon(trade.category)}
                              <span className="hidden sm:inline">{getCategoryLabel(trade.category)}</span>
                            </Badge>
                            <Badge 
                              variant={trade.action === 'buy' ? 'default' : 'destructive'}
                              className={`${trade.action === 'buy' 
                                ? 'bg-[oklch(0.70_0.12_145_/_0.2)] text-[oklch(0.70_0.12_145)] border border-[oklch(0.70_0.12_145_/_0.4)]'
                                : 'bg-[oklch(0.58_0.18_25_/_0.2)] text-[oklch(0.58_0.18_25)] border border-[oklch(0.58_0.18_25_/_0.4)]'
                              } flex items-center gap-1 text-xs`}
                            >
                              {trade.action === 'buy' ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                              {trade.action.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="mb-1 text-sm sm:text-base">
                            <span className="font-semibold text-[oklch(0.70_0.14_75)]">{trade.trader}</span>
                            <span className="text-[oklch(0.55_0.10_75)] hidden sm:inline"> • {trade.title}</span>
                          </div>
                          
                          <div className="text-xs sm:text-sm text-[oklch(0.60_0.10_75)] truncate">
                            <span className="font-medium text-[oklch(0.70_0.14_75)]">{trade.asset}</span> • {trade.amount}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1.5 sm:mt-2 text-xs text-[oklch(0.50_0.08_75)]">
                            <span className="truncate">Disclosed {formatDistanceToNow(trade.disclosureDate, { addSuffix: true })}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">Traded {formatDistanceToNow(trade.tradeDate, { addSuffix: true })}</span>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="text-base sm:text-xl font-bold text-[oklch(0.70_0.14_75)]">
                            {formatCurrency(trade.value)}
                          </div>
                          <div className="text-xs text-[oklch(0.55_0.10_75)] mt-1">
                            {trade.assetType}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {!isPremium && hiddenTradesCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.08_0.006_70_/_0.5)] to-[oklch(0.08_0.006_70)] pointer-events-none -mt-16 rounded-lg" />
                      <div className="relative p-6 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border-2 border-[oklch(0.65_0.12_75_/_0.5)] text-center">
                        <div className="mb-4">
                          <LockKey size={48} weight="fill" className="mx-auto text-[oklch(0.70_0.14_75)] opacity-60" />
                        </div>
                        <h3 className="text-xl font-playfair text-[oklch(0.70_0.14_75)] mb-2">
                          {hiddenTradesCount} More {hiddenTradesCount === 1 ? 'Trade' : 'Trades'} Available
                        </h3>
                        <p className="text-[oklch(0.60_0.10_75)] mb-4 text-sm">
                          Upgrade to Premium to unlock all insider trades and get the full picture of what's happening in the market.
                        </p>
                        <Button
                          onClick={onUpgradeClick}
                          className="bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] hover:shadow-[0_0_30px_oklch(0.70_0.14_75_/_0.4)] transition-all border border-[oklch(0.70_0.14_75)]"
                        >
                          <Sparkle size={18} weight="fill" className="mr-2" />
                          Upgrade to Premium
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
