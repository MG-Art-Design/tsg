import { useState } from 'react'
import { Portfolio, UserProfile, Asset } from '@/lib/types'
import { 
  formatCurrency, 
  formatPercent, 
  getSubscriptionFeatures,
  INITIAL_PORTFOLIO_VALUE
} from '@/lib/helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { TrendUp, TrendDown, Plus, Trash, PencilSimple, Crown, Lightning, ArrowLeft, FileArrowUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PortfolioManager } from './PortfolioManager'
import { PortfolioImporter } from './PortfolioImporter'

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
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [portfolioName, setPortfolioName] = useState('')
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null)
  
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
    
    onCreatePortfolio([], portfolioName, `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    
    toast.success('Portfolio created!', {
      description: `"${portfolioName}" is ready. Click on it to add positions.`,
      duration: 5000
    })
    
    setPortfolioName('')
  }

  const handleImportClick = () => {
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
    setShowImportDialog(true)
  }

  const handleImportPortfolio = (positions: Array<{ symbol: string; name: string; type: 'stock' | 'crypto'; allocation: number }>, portfolioName: string) => {
    const existingNames = portfolios.map(p => p.name.toLowerCase())
    if (existingNames.includes(portfolioName.toLowerCase())) {
      const uniqueName = `${portfolioName} (Imported ${Date.now()})`
      onCreatePortfolio(positions, uniqueName, `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      return
    }

    onCreatePortfolio(positions, portfolioName, `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
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
  const editingPortfolio = editingPortfolioId ? portfolios.find(p => p.id === editingPortfolioId) : null

  if (editingPortfolio) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setEditingPortfolioId(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft weight="bold" />
          Back to Portfolios
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{editingPortfolio.name}</CardTitle>
            <CardDescription>
              {editingPortfolio.quarter} • Total value: {formatCurrency(INITIAL_PORTFOLIO_VALUE)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioManager
              currentPortfolio={editingPortfolio}
              marketData={marketData}
              onSave={(positions) => {
                onCreatePortfolio(positions, editingPortfolio.name, editingPortfolio.id)
                setEditingPortfolioId(null)
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold truncate">My Portfolios</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isPremium ? (
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-[oklch(0.70_0.14_75)] inline-block relative" weight="fill" style={{ filter: 'drop-shadow(0 0 4px oklch(0.70 0.14 75 / 0.5))' }} />
                <span className="text-xs sm:text-sm">Premium: Unlimited portfolios</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm">
                {currentPortfolioCount} of {maxPortfolios} portfolios created
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleImportClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            disabled={!canCreateMore && !isPremium}
          >
            <FileArrowUp weight="bold" className="w-4 h-4" />
            <span className="hidden xs:inline">Import CSV</span>
            <span className="xs:hidden">Import</span>
          </Button>
          <Button
            onClick={handleCreateClick}
            size="sm"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            disabled={!canCreateMore && !isPremium}
          >
            <Plus weight="bold" className="w-4 h-4" />
            <span className="hidden xs:inline">New Portfolio</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {!isPremium && !canCreateMore && (
        <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-[oklch(0.08_0.006_70)] to-[oklch(0.05_0.008_70)] premium-border-shimmer premium-glow">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-[oklch(0.70_0.14_75)] text-base sm:text-lg">
              <Crown weight="fill" className="gold-shimmer-fast w-5 h-5 sm:w-6 sm:h-6" />
              <span className="truncate">Upgrade to Premium for Unlimited Portfolios</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Create as many portfolios as you need. Test different strategies, track multiple quarters, and compare performance across all your portfolios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onUpgradeClick} className="w-full gold-shimmer text-xs sm:text-sm" size="sm">
              <Lightning weight="fill" className="mr-2 w-4 h-4" />
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {gamePortfolios.map((portfolio) => {
          const isPositive = portfolio.totalReturnPercent >= 0

          return (
            <Card
              key={portfolio.id}
              className="cursor-pointer transition-all hover:shadow-lg card-link"
              onClick={() => setEditingPortfolioId(portfolio.id)}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{portfolio.name}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      {portfolio.quarter}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 icon-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenameClick(portfolio.id)
                      }}
                    >
                      <PencilSimple className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive icon-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(portfolio.id)
                      }}
                    >
                      <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-[oklch(0.70_0.14_75)]">
                      {formatCurrency(portfolio.currentValue)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      Initial: {formatCurrency(portfolio.initialValue)}
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold ${
                    isPositive ? 'text-success' : 'text-destructive'
                  }`}>
                    {isPositive ? (
                      <TrendUp weight="bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    ) : (
                      <TrendDown weight="bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    )}
                    <span>{formatPercent(portfolio.totalReturnPercent)}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
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

      <PortfolioImporter
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportPortfolio}
      />
    </div>
  )
}
