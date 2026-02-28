import { useState } from 'react'
import { Portfolio, UserProfile, Asset } from '@/lib/types'
import { 
  formatCurrency, 
  formatPercent, 
  getSubscriptionFeatures 
} from '@/lib/helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { TrendUp, TrendDown, Plus, Trash, PencilSimple, Crown, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MultiPortfolioManagerProps {
  portfolios: Portfolio[]
  userProfile: UserProfile
  marketData: Asset[]
  onCreatePortfolio: (positions: Array<{ symbol: string; name: string; type: 'stock' | 'crypto'; allocation: number }>, portfolioName?: string, portfolioId?: string) => void
  onDeletePortfolio: (portfolioId: string) => void
  onRenamePortfolio: (portfolioId: string, newName: string) => void
  onSelectPortfolio: (portfolioId: string) => void
  onUpgradeClick: () => void
}

export function MultiPortfolioManager({
  portfolios,
  userProfile,
  marketData,
  onCreatePortfolio,
  onDeletePortfolio,
  onRenamePortfolio,
  onSelectPortfolio,
  onUpgradeClick
}: MultiPortfolioManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [portfolioName, setPortfolioName] = useState('')
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  
  const features = getSubscriptionFeatures(userProfile.subscription.tier)
  const maxPortfolios = features.maxPortfolios
  const currentPortfolioCount = portfolios.filter(p => !p.isLinkedAccount).length
  const canCreateMore = maxPortfolios === -1 || currentPortfolioCount < maxPortfolios
  const isPremium = userProfile.subscription.tier === 'premium'

  const handleCreateClick = () => {
    if (!canCreateMore) {
      toast.error('Portfolio limit reached', {
        description: `Free tier allows up to ${maxPortfolios} portfolios. Upgrade to Premium for unlimited portfolios.`,
        action: {
          label: 'Upgrade',
          onClick: onUpgradeClick
        }
      })
      return
    }
    setPortfolioName('')
    setShowCreateDialog(true)
  }

  const handleCreatePortfolio = () => {
    if (!portfolioName.trim()) {
      toast.error('Please enter a portfolio name')
      return
    }

    const existingNames = portfolios.map(p => p.name.toLowerCase())
    if (existingNames.includes(portfolioName.toLowerCase())) {
      toast.error('A portfolio with this name already exists')
      return
    }

    setShowCreateDialog(false)
    onSelectPortfolio('create-new')
    toast.success('Navigate to Portfolio tab to add positions', {
      description: `Your new portfolio "${portfolioName}" is ready to be configured.`
    })
  }

  const handleRenameClick = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId)
    if (!portfolio) return
    setSelectedPortfolioId(portfolioId)
    setPortfolioName(portfolio.name)
    setShowRenameDialog(true)
  }

  const handleRename = () => {
    if (!selectedPortfolioId || !portfolioName.trim()) {
      toast.error('Please enter a valid portfolio name')
      return
    }

    const existingNames = portfolios
      .filter(p => p.id !== selectedPortfolioId)
      .map(p => p.name.toLowerCase())
    
    if (existingNames.includes(portfolioName.toLowerCase())) {
      toast.error('A portfolio with this name already exists')
      return
    }

    onRenamePortfolio(selectedPortfolioId, portfolioName)
    setShowRenameDialog(false)
    toast.success('Portfolio renamed successfully')
  }

  const handleDeleteClick = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId)
    setShowDeleteDialog(true)
  }

  const handleDelete = () => {
    if (!selectedPortfolioId) return
    onDeletePortfolio(selectedPortfolioId)
    setShowDeleteDialog(false)
    setSelectedPortfolioId(null)
    toast.success('Portfolio deleted')
  }

  const gamePortfolios = portfolios.filter(p => !p.isLinkedAccount)
  const selectedPortfolio = selectedPortfolioId ? portfolios.find(p => p.id === selectedPortfolioId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Portfolios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isPremium ? (
              <span className="flex items-center gap-1">
                <Crown className="w-4 h-4 text-[oklch(0.70_0.14_75)] inline-block relative" weight="fill" style={{ filter: 'drop-shadow(0 0 4px oklch(0.70 0.14 75 / 0.5))' }} />
                Premium: Unlimited portfolios
              </span>
            ) : (
              <span>
                {currentPortfolioCount} of {maxPortfolios} portfolios created
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="flex items-center gap-2"
          disabled={!canCreateMore && !isPremium}
        >
          <Plus weight="bold" />
          New Portfolio
        </Button>
      </div>

      {!isPremium && !canCreateMore && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-[oklch(0.08_0.006_70)] to-[oklch(0.05_0.008_70)] premium-border-shimmer premium-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[oklch(0.70_0.14_75)]">
              <Crown weight="fill" className="gold-shimmer-fast" />
              Upgrade to Premium for Unlimited Portfolios
            </CardTitle>
            <CardDescription>
              Create as many portfolios as you need. Test different strategies, track multiple quarters, and compare performance across all your portfolios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onUpgradeClick} className="w-full gold-shimmer">
              <Lightning weight="fill" className="mr-2" />
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gamePortfolios.map((portfolio) => {
          const isPositive = portfolio.totalReturnPercent >= 0

          return (
            <Card
              key={portfolio.id}
              className="cursor-pointer transition-all hover:shadow-lg card-link"
              onClick={() => onSelectPortfolio(portfolio.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {portfolio.quarter}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 icon-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenameClick(portfolio.id)
                      }}
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive icon-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(portfolio.id)
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
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
                    <div className="text-xs text-muted-foreground">
                      {portfolio.positions.length} position{portfolio.positions.length !== 1 ? 's' : ''}
                    </div>

                    {portfolio.positions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {portfolio.positions.slice(0, 5).map((pos) => (
                          <Badge key={pos.symbol} variant="outline" className="text-xs">
                            {pos.symbol}
                          </Badge>
                        ))}
                        {portfolio.positions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{portfolio.positions.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {gamePortfolios.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightning className="w-12 h-12 mx-auto mb-4 text-muted-foreground" weight="fill" />
            <p className="text-muted-foreground mb-4">No portfolios yet</p>
            <Button onClick={handleCreateClick}>
              <Plus weight="bold" className="mr-2" />
              Create Your First Portfolio
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
            <DialogDescription>
              Give your portfolio a memorable name. You'll configure positions in the next step.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-name">Portfolio Name</Label>
              <Input
                id="portfolio-name"
                placeholder="e.g., Tech Giants 2025, Crypto Moon Shot, Dividend Kings"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePortfolio()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePortfolio}>Create Portfolio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Portfolio</DialogTitle>
            <DialogDescription>
              Enter a new name for this portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-portfolio">Portfolio Name</Label>
              <Input
                id="rename-portfolio"
                placeholder="Enter new name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPortfolio?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
