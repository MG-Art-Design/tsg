import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InsiderTrade } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { motion } from 'framer-motion'
import { Sparkle, TrendUp, TrendDown, Gavel, Buildings, User } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

interface InsiderTradesProps {
  trades: InsiderTrade[]
}

export function InsiderTrades({ trades }: InsiderTradesProps) {
  const [filter, setFilter] = useState<'all' | 'congress' | 'whitehouse' | 'trump-family'>('all')

  const filteredTrades = filter === 'all' 
    ? trades 
    : trades.filter(t => t.category === filter)

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
      <Card className="border-2 border-[oklch(0.85_0.12_60)] bg-gradient-to-br from-[oklch(0.12_0.01_240)] to-[oklch(0.08_0.015_240)] shadow-[0_0_40px_oklch(0.85_0.12_60_/_0.15)]">
        <CardHeader className="border-b border-[oklch(0.85_0.12_60_/_0.3)] bg-gradient-to-r from-[oklch(0.85_0.12_60_/_0.05)] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[oklch(0.85_0.12_60_/_0.15)] border border-[oklch(0.85_0.12_60_/_0.4)]">
                <Sparkle size={24} weight="fill" className="text-[oklch(0.85_0.12_60)]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-playfair text-[oklch(0.85_0.12_60)] flex items-center gap-2">
                  Stonk: Omg It's In
                </CardTitle>
                <p className="text-sm text-[oklch(0.85_0.12_60_/_0.7)] mt-1">
                  Insider moves you need to know
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="border-[oklch(0.85_0.12_60_/_0.4)] text-[oklch(0.85_0.12_60)] bg-[oklch(0.85_0.12_60_/_0.1)]"
            >
              {filteredTrades.length} Trades
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-[oklch(0.15_0.015_240)] border border-[oklch(0.85_0.12_60_/_0.2)]">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-[oklch(0.85_0.12_60_/_0.2)] data-[state=active]:text-[oklch(0.85_0.12_60)]"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="congress"
                className="data-[state=active]:bg-[oklch(0.85_0.12_60_/_0.2)] data-[state=active]:text-[oklch(0.85_0.12_60)]"
              >
                Congress
              </TabsTrigger>
              <TabsTrigger 
                value="whitehouse"
                className="data-[state=active]:bg-[oklch(0.85_0.12_60_/_0.2)] data-[state=active]:text-[oklch(0.85_0.12_60)]"
              >
                White House
              </TabsTrigger>
              <TabsTrigger 
                value="trump-family"
                className="data-[state=active]:bg-[oklch(0.85_0.12_60_/_0.2)] data-[state=active]:text-[oklch(0.85_0.12_60)]"
              >
                Trump Family
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-3">
              {filteredTrades.length === 0 ? (
                <div className="text-center py-12 text-[oklch(0.85_0.12_60_/_0.5)]">
                  <Sparkle size={48} weight="fill" className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No trades in this category yet</p>
                </div>
              ) : (
                filteredTrades.map((trade, i) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-[oklch(0.15_0.015_240)] to-[oklch(0.12_0.01_240)] border border-[oklch(0.85_0.12_60_/_0.2)] hover:border-[oklch(0.85_0.12_60_/_0.4)] transition-all hover:shadow-[0_0_20px_oklch(0.85_0.12_60_/_0.1)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline"
                            className="border-[oklch(0.85_0.12_60_/_0.4)] text-[oklch(0.85_0.12_60)] bg-[oklch(0.85_0.12_60_/_0.1)] flex items-center gap-1"
                          >
                            {getCategoryIcon(trade.category)}
                            {getCategoryLabel(trade.category)}
                          </Badge>
                          <Badge 
                            variant={trade.action === 'buy' ? 'default' : 'destructive'}
                            className={trade.action === 'buy' 
                              ? 'bg-[oklch(0.70_0.12_145_/_0.2)] text-[oklch(0.70_0.12_145)] border border-[oklch(0.70_0.12_145_/_0.4)]'
                              : 'bg-[oklch(0.58_0.18_25_/_0.2)] text-[oklch(0.58_0.18_25)] border border-[oklch(0.58_0.18_25_/_0.4)]'
                            }
                          >
                            {trade.action === 'buy' ? <TrendUp size={14} weight="bold" /> : <TrendDown size={14} weight="bold" />}
                            {trade.action.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="mb-1">
                          <span className="font-semibold text-[oklch(0.85_0.12_60)]">{trade.trader}</span>
                          <span className="text-[oklch(0.85_0.12_60_/_0.6)]"> • {trade.title}</span>
                        </div>
                        
                        <div className="text-sm text-[oklch(0.85_0.12_60_/_0.7)]">
                          <span className="font-medium text-[oklch(0.85_0.12_60)]">{trade.asset}</span> • {trade.amount}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-[oklch(0.85_0.12_60_/_0.5)]">
                          <span>Disclosed {formatDistanceToNow(trade.disclosureDate, { addSuffix: true })}</span>
                          <span>•</span>
                          <span>Traded {formatDistanceToNow(trade.tradeDate, { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-[oklch(0.85_0.12_60)]">
                          {formatCurrency(trade.value)}
                        </div>
                        <div className="text-xs text-[oklch(0.85_0.12_60_/_0.5)] mt-1">
                          {trade.assetType}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
