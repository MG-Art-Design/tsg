import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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

  useEffect(() => {
    const currentAllocationString = JSON.stringify(
      Object.fromEntries(
        Object.entries(allocations)
          .filter(([, val]) => val > 0)
          .sort()
      )
    )
    
    const initialAllocationString = JSON.stringify(
      Object.fromEntries(
        (currentPortfolio?.positions || [])
          .map(p => [p.symbol, p.allocation])
          .sort()
      )
    )
    
    setHasUnsavedChanges(currentAllocationString !== initialAllocationString)
  }, [allocations, currentPortfolio])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (isValidAllocation && Object.keys(allocations).length > 0) {
          setIsConfirmOpen(true)
        } else if (!isValidAllocation) {
          toast.warning('Cannot save', {
            description: 'Total allocation must equal 100%'
          })
        } else {
          toast.warning('Cannot save', {
            description: 'Add at least one position'
          })
        }
      }
      if (e.key === 'Escape' && isConfirmOpen) {
        setIsConfirmOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [allocations, isValidAllocation, isConfirmOpen])

  const handleAllocationChange = (symbol: string, value: string) => {
    if (value === '') {
      setAllocations(prev => ({
        ...prev,
        [symbol]: 0
      }))
      return
    }
    
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return
    
    setAllocations(prev => {
      const newAllocations = {
        ...prev,
        [symbol]: Math.min(100, Math.max(0, numValue))
      }
      
      const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0)
      if (total > 100) {
        toast.warning('Allocation exceeds 100%', {
          description: `Current total: ${total.toFixed(1)}%. Reduce other positions.`
        })
      }
      
      return newAllocations
    })
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
            {hasUnsavedChanges && (
              <Badge variant="outline" className="ml-auto text-yellow-500 border-yellow-500">
                Unsaved Changes
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            You've got {formatCurrency(INITIAL_PORTFOLIO_VALUE)} to play with. Allocate wisely... or go all in on meme coins. Your call.
          </p>
        </CardHeader>
      </Card>

      {Object.keys(allocations).length === 0 && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-muted/20">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Lightning size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Positions Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Select stocks or crypto below to start building your portfolio. Click any asset to add it to your allocation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(allocations).length > 0 && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Allocation</CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAllocations({})
                    toast.info('All positions cleared')
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  title="Clear all positions"
                >
                  Clear All
                </Button>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isValidAllocation ? 'text-success' : totalAllocation > 100 ? 'text-destructive' : 'text-warning'}`}>
                    {totalAllocation.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isValidAllocation ? '✓ Ready to save' : totalAllocation > 100 ? '⚠ Over 100%' : `${(100 - totalAllocation).toFixed(1)}% remaining`}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isValidAllocation ? 'bg-success' : 
                    totalAllocation > 100 ? 'bg-destructive' : 
                    'bg-primary'
                  }`}
                  style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(allocations).map(([symbol, allocation]) => {
              const asset = marketData.find(a => a.symbol === symbol)
              if (!asset) return null
              
              const handleQuickFill = (percent: number) => {
                setAllocations(prev => ({
                  ...prev,
                  [symbol]: percent
                }))
              }
              
              return (
                <div key={symbol} className="flex items-center gap-3 p-3 rounded-lg bg-card border-2 border-[oklch(0.70_0.14_75)]/30">
                  <Badge variant={asset.type === 'crypto' ? 'default' : 'secondary'}>
                    {asset.type === 'crypto' ? '₿' : '$'}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-semibold">{symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 flex-1">
                    <div className="hidden sm:flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFill(10)}
                        className="h-6 px-2 text-xs"
                        title="Set to 10%"
                      >
                        10%
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFill(25)}
                        className="h-6 px-2 text-xs"
                        title="Set to 25%"
                      >
                        25%
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFill(50)}
                        className="h-6 px-2 text-xs"
                        title="Set to 50%"
                      >
                        50%
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
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
                        className="text-destructive hover:text-destructive flex-shrink-0"
                        title="Remove from portfolio"
                      >
                        <span className="hidden sm:inline">Remove</span>
                        <span className="sm:hidden">✕</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={!isValidAllocation || Object.keys(allocations).length === 0}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 mt-4"
              title={!isValidAllocation ? 'Total allocation must equal 100%' : 'Save your portfolio (Ctrl+S / Cmd+S)'}
            >
              Save Portfolio {isValidAllocation && '✓'}
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
