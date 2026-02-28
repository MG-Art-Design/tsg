import { useState } from 'react'
import { Portfolio, UserProfile, Asset } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendUp, TrendDown, ChartBar, Coins, ArrowsLeftRight } from '@phosphor-icons/react'

interface PortfolioComparisonViewProps {
  portfolios: Portfolio[]
  userProfile: UserProfile
  marketData: Asset[]
  onSelectPortfolio?: (portfolioId: string) => void
}

export function PortfolioComparisonView({
  portfolios,
  userProfile,
  marketData,
  onSelectPortfolio
}: PortfolioComparisonViewProps) {
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid')

  const linkedPortfolios = portfolios.filter(p => p.isLinkedAccount)
  const gamePortfolios = portfolios.filter(p => !p.isLinkedAccount)

  const togglePortfolioSelection = (portfolioId: string) => {
    setSelectedPortfolios(current => {
      if (current.includes(portfolioId)) {
        return current.filter(id => id !== portfolioId)
      }
      if (current.length < 4) {
        return [...current, portfolioId]
      }
      return current
    })
  }

  const getLinkedAccountInfo = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId)
    if (!portfolio?.linkedAccountId) return null
    return userProfile.linkedAccounts?.find(acc => acc.id === portfolio.linkedAccountId)
  }

  const renderPortfolioCard = (portfolio: Portfolio) => {
    const isSelected = selectedPortfolios.includes(portfolio.id)
    const linkedAccount = getLinkedAccountInfo(portfolio.id)
    const isPositive = portfolio.totalReturnPercent >= 0

    return (
      <Card
        key={portfolio.id}
        className={`cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-primary shadow-xl' : ''
        }`}
        onClick={() => {
          if (viewMode === 'comparison') {
            togglePortfolioSelection(portfolio.id)
          } else if (onSelectPortfolio) {
            onSelectPortfolio(portfolio.id)
          }
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {portfolio.name}
                {portfolio.isLinkedAccount && (
                  <Badge variant="secondary" className="text-xs">
                    <ArrowsLeftRight className="w-3 h-3 mr-1" />
                    Linked
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {portfolio.isLinkedAccount && linkedAccount ? (
                  <span className="capitalize">{linkedAccount.platform}</span>
                ) : (
                  <span>{portfolio.quarter}</span>
                )}
              </CardDescription>
            </div>
            {viewMode === 'comparison' && (
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
              }`}>
                {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">
                {formatCurrency(portfolio.currentValue)}
              </div>
              <div className="text-xs text-muted-foreground">
                Initial: {formatCurrency(portfolio.initialValue)}
              </div>
            </div>

            <div className={`flex items-center gap-2 text-sm font-semibold ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {isPositive ? (
                <TrendUp weight="bold" className="w-4 h-4" />
              ) : (
                <TrendDown weight="bold" className="w-4 h-4" />
              )}
              <span>{formatPercent(portfolio.totalReturnPercent)}</span>
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(Math.abs(portfolio.totalReturn))})
              </span>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ChartBar className="w-3 h-3" />
                  <span>{portfolio.positions.length} positions</span>
                </div>
                <div>
                  Updated {new Date(portfolio.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              {portfolio.positions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {portfolio.positions.slice(0, 3).map((pos) => (
                    <Badge key={pos.symbol} variant="outline" className="text-xs">
                      {pos.symbol}
                    </Badge>
                  ))}
                  {portfolio.positions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{portfolio.positions.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComparisonTable = () => {
    if (selectedPortfolios.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <ChartBar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Select up to 4 portfolios to compare them side by side
            </p>
          </CardContent>
        </Card>
      )
    }

    const comparePortfolios = portfolios.filter(p => selectedPortfolios.includes(p.id))

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>
              Comparing {selectedPortfolios.length} portfolio{selectedPortfolios.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Metric</th>
                    {comparePortfolios.map(portfolio => (
                      <th key={portfolio.id} className="text-right py-3 px-4 text-sm font-semibold">
                        {portfolio.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">Current Value</td>
                    {comparePortfolios.map(portfolio => (
                      <td key={portfolio.id} className="text-right py-3 px-4 text-sm font-semibold">
                        {formatCurrency(portfolio.currentValue)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">Initial Value</td>
                    {comparePortfolios.map(portfolio => (
                      <td key={portfolio.id} className="text-right py-3 px-4 text-sm">
                        {formatCurrency(portfolio.initialValue)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">Total Return</td>
                    {comparePortfolios.map(portfolio => {
                      const isPositive = portfolio.totalReturn >= 0
                      return (
                        <td
                          key={portfolio.id}
                          className={`text-right py-3 px-4 text-sm font-semibold ${
                            isPositive ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {formatCurrency(portfolio.totalReturn)}
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">Return %</td>
                    {comparePortfolios.map(portfolio => {
                      const isPositive = portfolio.totalReturnPercent >= 0
                      return (
                        <td
                          key={portfolio.id}
                          className={`text-right py-3 px-4 text-sm font-semibold ${
                            isPositive ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {formatPercent(portfolio.totalReturnPercent)}
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">Positions</td>
                    {comparePortfolios.map(portfolio => (
                      <td key={portfolio.id} className="text-right py-3 px-4 text-sm">
                        {portfolio.positions.length}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">Last Updated</td>
                    {comparePortfolios.map(portfolio => (
                      <td key={portfolio.id} className="text-right py-3 px-4 text-sm">
                        {new Date(portfolio.lastUpdated).toLocaleDateString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparePortfolios.map(portfolio => (
                <div key={portfolio.id} className="space-y-2">
                  <div className="font-semibold text-sm">{portfolio.name}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {portfolio.positions.map(pos => (
                      <div
                        key={`${portfolio.id}-${pos.symbol}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {pos.type === 'crypto' ? (
                            <Coins className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChartBar className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-semibold text-sm">{pos.symbol}</span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            pos.returnPercent >= 0 ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {formatPercent(pos.returnPercent)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (portfolios.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ChartBar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No portfolios to compare</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Comparison</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compare your game portfolios and linked trading accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'comparison' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('comparison')}
          >
            Compare
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border-2 border-[oklch(0.70_0.14_75)]">
          <TabsTrigger value="all">All Portfolios</TabsTrigger>
          <TabsTrigger value="game">Game Portfolios</TabsTrigger>
          <TabsTrigger value="linked">Linked Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'comparison' ? (
            renderComparisonTable()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map(renderPortfolioCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="game" className="space-y-4">
          {viewMode === 'comparison' ? (
            renderComparisonTable()
          ) : gamePortfolios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gamePortfolios.map(renderPortfolioCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ChartBar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No game portfolios yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="linked" className="space-y-4">
          {viewMode === 'comparison' ? (
            renderComparisonTable()
          ) : linkedPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedPortfolios.map(renderPortfolioCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowsLeftRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No linked accounts yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Link your trading accounts in the Profile tab
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
