import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { Asset, Portfolio } from '@/lib/types'
import { formatCurrency, formatPercent, INITIAL_PORTFOLIO_VALUE } from '@/lib/helpers'
import { MagnifyingGlass, Coins, ChartBar, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PortfolioManagerProps {
  currentPortfolio: Portfolio | null
  marketData: Asset[]
  onSave: (positions: Array<{ symbol: string; name: string; type: 'stock' | 'crypto'; allocation: number }>) => void
}

export function PortfolioManager({ currentPortfolio, marketData, onSave }: PortfolioManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    currentPortfolio?.positions.forEach(pos => {
      initial[pos.symbol] = pos.allocation
    })
    return initial
  })
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const stocks = marketData.filter(a => a.type === 'stock')
  const crypto = marketData.filter(a => a.type === 'crypto')

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredCrypto = crypto.filter(c =>
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0)
  const isValidAllocation = totalAllocation === 100

  const handleAllocationChange = (symbol: string, value: string) => {
    const numValue = parseFloat(value) || 0
    if (numValue < 0 || numValue > 100) return
    
    setAllocations(prev => ({
      ...prev,
      [symbol]: numValue
    }))
  }

  const handleRemove = (symbol: string) => {
    setAllocations(prev => {
      const newAllocations = { ...prev }
      delete newAllocations[symbol]
      return newAllocations
    })
  }

  const handleSave = () => {
    if (!isValidAllocation) {
      toast.error('Invalid allocation', {
        description: `Total allocation is ${totalAllocation.toFixed(1)}%. Must equal 100%.`
      })
      return
    }

    const positions = Object.entries(allocations)
      .filter(([_, allocation]) => allocation > 0)
      .map(([symbol, allocation]) => {
        const asset = marketData.find(a => a.symbol === symbol)!
        return {
          symbol,
          name: asset.name,
          type: asset.type,
          allocation
        }
      })

    if (positions.length === 0) {
      toast.error('No positions', {
        description: 'Add at least one position to your portfolio.'
      })
      return
    }

    onSave(positions)
    setIsConfirmOpen(false)
    toast.success('Portfolio updated!', {
      description: `Your ${positions.length} positions are locked in. Let's see how they perform!`
    })
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[oklch(0.70_0.14_75)]">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lightning size={28} weight="fill" className="text-primary" />
            Build Your Portfolio
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            You've got {formatCurrency(INITIAL_PORTFOLIO_VALUE)} to play with. Allocate wisely... or go all in on meme coins. Your call.
          </p>
        </CardHeader>
      </Card>

      {Object.keys(allocations).length > 0 && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Allocation</CardTitle>
              <div className="text-right">
                <div className={`text-2xl font-bold ${isValidAllocation ? 'text-success' : 'text-destructive'}`}>
                  {totalAllocation.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {isValidAllocation ? '✓ Ready to save' : 'Must equal 100%'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(allocations).map(([symbol, allocation]) => {
              const asset = marketData.find(a => a.symbol === symbol)
              if (!asset) return null
              
              return (
                <div key={symbol} className="flex items-center gap-3 p-3 rounded-lg bg-card border-2 border-[oklch(0.70_0.14_75)]/30">
                  <Badge variant={asset.type === 'crypto' ? 'default' : 'secondary'}>
                    {asset.type === 'crypto' ? '₿' : '$'}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-semibold">{symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={allocation}
                      onChange={(e) => handleAllocationChange(symbol, e.target.value)}
                      className="w-20 text-right"
                      min={0}
                      max={100}
                      step={0.1}
                    />
                    <span className="text-muted-foreground">%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(symbol)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={!isValidAllocation}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 mt-4"
            >
              Save Portfolio
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-[oklch(0.70_0.14_75)]">
        <CardHeader>
          <div className="relative">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stocks or crypto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stocks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stocks" className="flex items-center gap-2">
                <ChartBar size={16} />
                Stocks
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Coins size={16} />
                Crypto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stocks" className="space-y-2 mt-4">
              {filteredStocks.map(stock => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(stock.currentPrice)}</div>
                      <div className={`text-sm ${stock.priceChangePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercent(stock.priceChangePercent24h)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!allocations[stock.symbol]) {
                          setAllocations(prev => ({ ...prev, [stock.symbol]: 0 }))
                        }
                      }}
                      disabled={!!allocations[stock.symbol]}
                      variant={allocations[stock.symbol] ? 'secondary' : 'default'}
                    >
                      {allocations[stock.symbol] ? 'Added' : 'Add'}
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-2 mt-4">
              {filteredCrypto.map(coin => (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="font-semibold">{coin.symbol}</div>
                    <div className="text-sm text-muted-foreground">{coin.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(coin.currentPrice)}</div>
                      <div className={`text-sm ${coin.priceChangePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercent(coin.priceChangePercent24h)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!allocations[coin.symbol]) {
                          setAllocations(prev => ({ ...prev, [coin.symbol]: 0 }))
                        }
                      }}
                      disabled={!!allocations[coin.symbol]}
                      variant={allocations[coin.symbol] ? 'secondary' : 'default'}
                    >
                      {allocations[coin.symbol] ? 'Added' : 'Add'}
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Portfolio</DialogTitle>
            <DialogDescription>
              Once you lock this in, these positions are yours for the quarter. No backing out now!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-4">
            {Object.entries(allocations).map(([symbol, allocation]) => {
              const asset = marketData.find(a => a.symbol === symbol)
              return asset ? (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="font-semibold">{allocation}%</span>
                </div>
              ) : null
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-accent">
              Lock It In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
