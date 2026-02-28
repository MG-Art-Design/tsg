import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserProfile, LinkedTradingAccount, ImportedPosition } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Link, 
  LinkBreak, 
  Bank, 
  CheckCircle, 
  Warning, 
  ArrowsClockwise,
  Plus,
  LockKey,
  Sparkle,
  TrendUp,
  TrendDown,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { HapticFeedback } from '@/lib/haptics'

interface TradingAccountLinkerProps {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export function TradingAccountLinker({ profile, onUpdate }: TradingAccountLinkerProps) {
  const [isLinking, setIsLinking] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [accountName, setAccountName] = useState('')
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  const isPremium = profile.subscription.tier === 'premium'
  const linkedAccounts = profile.linkedAccounts || []
  const importedPositions = profile.importedPositions || []

  const platformOptions = [
    { value: 'robinhood', label: 'Robinhood', icon: '🏹' },
    { value: 'sofi', label: 'SoFi', icon: '🏦' },
    { value: 'webull', label: 'Webull', icon: '🐂' },
    { value: 'etrade', label: 'E*TRADE', icon: '📊' },
    { value: 'fidelity', label: 'Fidelity', icon: '💼' },
    { value: 'tdameritrade', label: 'TD Ameritrade', icon: '🎯' },
    { value: 'other', label: 'Other Platform', icon: '🔗' }
  ]

  const handleLinkAccount = async () => {
    if (!selectedPlatform || !accountName.trim()) {
      toast.error('Missing information', {
        description: 'Please select a platform and enter an account name.'
      })
      return
    }

    setIsLinking(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newAccount: LinkedTradingAccount = {
        id: Date.now().toString(),
        platform: selectedPlatform as LinkedTradingAccount['platform'],
        accountName: accountName.trim(),
        linkedAt: Date.now(),
        isActive: true
      }

      const updatedProfile = {
        ...profile,
        linkedAccounts: [...linkedAccounts, newAccount]
      }

      onUpdate(updatedProfile)

      HapticFeedback.tradeExecuted()

      toast.success('Account linked successfully!', {
        description: `${accountName} has been connected. Sync to import your positions.`
      })

      setShowLinkDialog(false)
      setSelectedPlatform('')
      setAccountName('')

      setTimeout(() => {
        handleSyncAccount(newAccount.id)
      }, 1000)

    } catch (error) {
      toast.error('Failed to link account', {
        description: 'Something went wrong. Please try again.'
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleSyncAccount = async (accountId: string) => {
    setIsSyncing(accountId)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const positions = await generateMockImportedPositions(accountId)
      const accountValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
      const totalCost = positions.reduce((sum, p) => sum + (p.averageCost * p.quantity), 0)
      const totalReturn = accountValue - totalCost
      const totalReturnPercent = (totalReturn / totalCost) * 100

      const updatedAccounts = linkedAccounts.map(acc => 
        acc.id === accountId 
          ? {
              ...acc,
              lastSyncedAt: Date.now(),
              currentValue: accountValue,
              totalReturn,
              totalReturnPercent
            }
          : acc
      )

      const existingPositions = importedPositions.filter(p => p.importedFrom !== accountId)
      const updatedPositions = [...existingPositions, ...positions]

      const updatedProfile = {
        ...profile,
        linkedAccounts: updatedAccounts,
        importedPositions: updatedPositions
      }

      onUpdate(updatedProfile)

      toast.success('Account synced!', {
        description: `Imported ${positions.length} positions from ${linkedAccounts.find(a => a.id === accountId)?.accountName}.`
      })

    } catch (error) {
      toast.error('Sync failed', {
        description: 'Could not sync account data. Try again later.'
      })
    } finally {
      setIsSyncing(null)
    }
  }

  const handleUnlinkAccount = (accountId: string) => {
    const account = linkedAccounts.find(a => a.id === accountId)
    
    const updatedProfile = {
      ...profile,
      linkedAccounts: linkedAccounts.filter(a => a.id !== accountId),
      importedPositions: importedPositions.filter(p => p.importedFrom !== accountId)
    }

    onUpdate(updatedProfile)

    toast.info('Account unlinked', {
      description: `${account?.accountName} has been disconnected.`
    })
  }

  const getPlatformLabel = (platform: string) => {
    return platformOptions.find(p => p.value === platform)?.label || platform
  }

  const getPlatformIcon = (platform: string) => {
    return platformOptions.find(p => p.value === platform)?.icon || '🔗'
  }

  if (!isPremium) {
    return (
      <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="ripple-container absolute inset-0">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
          </div>
        </div>
        <CardHeader className="relative z-10 pb-4 border-b border-[oklch(0.65_0.12_75_/_0.2)]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Link size={20} weight="bold" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-playfair text-[oklch(0.70_0.14_75)]">
                  Link Trading Accounts
                </CardTitle>
                <Badge className="bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border-0">
                  <Sparkle size={12} weight="fill" className="mr-1" />
                  Premium
                </Badge>
              </div>
              <CardDescription className="text-[oklch(0.55_0.10_75)] mt-1">
                Import positions from Robinhood, SoFi, and other platforms
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-6">
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-[oklch(0.65_0.12_75_/_0.15)] border-2 border-[oklch(0.65_0.12_75_/_0.5)]">
                <LockKey size={32} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-playfair font-semibold text-[oklch(0.70_0.14_75)] mb-2">
                Premium Feature
              </h3>
              <p className="text-sm text-[oklch(0.60_0.10_75)] max-w-md mx-auto">
                Connect your real trading accounts to import positions, track performance, and receive daily insider recommendations based on your actual portfolio.
              </p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-[oklch(0.55_0.10_75)] mb-4">Includes:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.65_0.10_75)]">
                  <CheckCircle size={14} weight="fill" className="mr-1" />
                  Portfolio Import
                </Badge>
                <Badge variant="outline" className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.65_0.10_75)]">
                  <CheckCircle size={14} weight="fill" className="mr-1" />
                  Live Sync
                </Badge>
                <Badge variant="outline" className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.65_0.10_75)]">
                  <CheckCircle size={14} weight="fill" className="mr-1" />
                  Daily Insider Signals
                </Badge>
                <Badge variant="outline" className="border-[oklch(0.65_0.12_75_/_0.5)] text-[oklch(0.65_0.10_75)]">
                  <CheckCircle size={14} weight="fill" className="mr-1" />
                  Options History
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[oklch(0.65_0.12_75_/_0.3)] bg-gradient-to-br from-[oklch(0.08_0.005_60)] to-[oklch(0.05_0.008_70)]">
      <CardHeader className="pb-4 border-b border-[oklch(0.65_0.12_75_/_0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[oklch(0.65_0.12_75_/_0.2)] border border-[oklch(0.65_0.12_75_/_0.5)]">
              <Link size={20} weight="bold" className="text-[oklch(0.70_0.14_75)]" />
            </div>
            <div>
              <CardTitle className="text-lg font-playfair text-[oklch(0.70_0.14_75)]">
                Linked Trading Accounts
              </CardTitle>
              <CardDescription className="text-[oklch(0.55_0.10_75)] mt-1">
                Import and sync your real positions
              </CardDescription>
            </div>
          </div>
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                className="bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)] border border-[oklch(0.70_0.14_75)]"
              >
                <Plus size={16} weight="bold" />
                <span className="hidden sm:inline ml-2">Link Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-[oklch(0.65_0.12_75_/_0.3)] bg-[oklch(0.08_0.005_60)]">
              <DialogHeader>
                <DialogTitle className="text-[oklch(0.70_0.14_75)] font-playfair">
                  Link Trading Account
                </DialogTitle>
                <DialogDescription className="text-[oklch(0.55_0.10_75)]">
                  Connect your brokerage account to import positions and track performance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-[oklch(0.65_0.10_75)]">
                    Trading Platform
                  </Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger 
                      id="platform"
                      className="border-[oklch(0.65_0.12_75_/_0.3)] bg-[oklch(0.10_0.005_60)]"
                    >
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent className="border-[oklch(0.65_0.12_75_/_0.3)] bg-[oklch(0.10_0.005_60)]">
                      {platformOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-name" className="text-[oklch(0.65_0.10_75)]">
                    Account Name
                  </Label>
                  <Input
                    id="account-name"
                    placeholder="e.g., My Investment Account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="border-[oklch(0.65_0.12_75_/_0.3)] bg-[oklch(0.10_0.005_60)]"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleLinkAccount}
                    disabled={isLinking || !selectedPlatform || !accountName.trim()}
                    className="w-full bg-[oklch(0.65_0.12_75)] hover:bg-[oklch(0.70_0.14_75)] text-[oklch(0.15_0.01_240)]"
                  >
                    {isLinking ? (
                      <>
                        <ArrowsClockwise size={16} className="animate-spin mr-2" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Link size={16} weight="bold" className="mr-2" />
                        Link Account
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-[oklch(0.50_0.08_75)] text-center">
                  Your account credentials are never stored. We use secure read-only API access.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {linkedAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Bank size={48} weight="fill" className="mx-auto mb-4 text-[oklch(0.65_0.12_75_/_0.3)]" />
            <p className="text-[oklch(0.60_0.10_75)] mb-2">No linked accounts yet</p>
            <p className="text-sm text-[oklch(0.50_0.08_75)] mb-4">
              Connect your trading accounts to import positions automatically
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {linkedAccounts.map((account) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-[oklch(0.10_0.005_60)] to-[oklch(0.08_0.006_70)] border border-[oklch(0.65_0.12_75_/_0.3)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{getPlatformIcon(account.platform)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[oklch(0.70_0.14_75)]">
                            {account.accountName}
                          </h4>
                          {account.isActive && (
                            <Badge 
                              variant="outline" 
                              className="border-[oklch(0.70_0.12_145_/_0.4)] text-[oklch(0.70_0.12_145)] bg-[oklch(0.70_0.12_145_/_0.15)] text-xs"
                            >
                              <CheckCircle size={12} weight="fill" className="mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[oklch(0.55_0.10_75)] mb-2">
                          {getPlatformLabel(account.platform)}
                        </p>
                        {account.lastSyncedAt && (
                          <div className="space-y-1">
                            <p className="text-xs text-[oklch(0.50_0.08_75)]">
                              Last synced: {new Date(account.lastSyncedAt).toLocaleString()}
                            </p>
                            {account.currentValue !== undefined && (
                              <div className="flex items-center gap-4 mt-2">
                                <div>
                                  <p className="text-xs text-[oklch(0.55_0.10_75)]">Portfolio Value</p>
                                  <p className="text-lg font-bold text-[oklch(0.70_0.14_75)]">
                                    {formatCurrency(account.currentValue)}
                                  </p>
                                </div>
                                {account.totalReturn !== undefined && (
                                  <div>
                                    <p className="text-xs text-[oklch(0.55_0.10_75)]">Total Return</p>
                                    <div className="flex items-center gap-1">
                                      {account.totalReturn >= 0 ? (
                                        <TrendUp size={16} weight="bold" className="text-[oklch(0.70_0.12_145)]" />
                                      ) : (
                                        <TrendDown size={16} weight="bold" className="text-[oklch(0.58_0.18_25)]" />
                                      )}
                                      <p className={`text-lg font-bold ${
                                        account.totalReturn >= 0 
                                          ? 'text-[oklch(0.70_0.12_145)]' 
                                          : 'text-[oklch(0.58_0.18_25)]'
                                      }`}>
                                        {formatCurrency(account.totalReturn)} ({formatPercent(account.totalReturnPercent || 0)})
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncAccount(account.id)}
                        disabled={isSyncing === account.id}
                        className="border-[oklch(0.65_0.12_75_/_0.3)] text-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                      >
                        {isSyncing === account.id ? (
                          <ArrowsClockwise size={14} className="animate-spin" />
                        ) : (
                          <ArrowsClockwise size={14} />
                        )}
                        <span className="hidden sm:inline ml-2">
                          {isSyncing === account.id ? 'Syncing...' : 'Sync'}
                        </span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnlinkAccount(account.id)}
                        disabled={isSyncing === account.id}
                        className="border-[oklch(0.58_0.18_25_/_0.3)] text-[oklch(0.58_0.18_25)] hover:bg-[oklch(0.58_0.18_25_/_0.15)]"
                      >
                        <LinkBreak size={14} />
                        <span className="hidden sm:inline ml-2">Unlink</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {importedPositions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[oklch(0.65_0.12_75_/_0.2)]">
                <div className="flex items-center gap-2 mb-4">
                  <Lightning size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                  <h4 className="font-semibold text-[oklch(0.70_0.14_75)]">
                    Imported Positions ({importedPositions.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {importedPositions.slice(0, 5).map((position) => (
                    <div
                      key={`${position.symbol}-${position.importedFrom}`}
                      className="p-3 rounded-lg bg-[oklch(0.10_0.005_60)] border border-[oklch(0.65_0.12_75_/_0.2)] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[oklch(0.70_0.14_75)]">
                            {position.symbol}
                          </span>
                          <Badge 
                            variant="outline"
                            className="text-xs border-[oklch(0.65_0.12_75_/_0.3)] text-[oklch(0.60_0.10_75)]"
                          >
                            {position.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-[oklch(0.55_0.10_75)] mt-0.5">
                          {position.quantity} shares @ {formatCurrency(position.averageCost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[oklch(0.70_0.14_75)]">
                          {formatCurrency(position.marketValue)}
                        </p>
                        <p className={`text-xs ${
                          position.totalReturn >= 0 
                            ? 'text-[oklch(0.70_0.12_145)]' 
                            : 'text-[oklch(0.58_0.18_25)]'
                        }`}>
                          {formatPercent(position.totalReturnPercent)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {importedPositions.length > 5 && (
                    <p className="text-xs text-[oklch(0.50_0.08_75)] text-center pt-2">
                      + {importedPositions.length - 5} more positions
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function generateMockImportedPositions(accountId: string): Promise<ImportedPosition[]> {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' as const },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' as const },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' as const },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' as const },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' as const },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' as const },
    { symbol: 'META', name: 'Meta Platforms', type: 'stock' as const },
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' as const },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto' as const },
    { symbol: 'SOL', name: 'Solana', type: 'crypto' as const }
  ]

  const numPositions = Math.floor(Math.random() * 5) + 3
  const selectedStocks = stocks.sort(() => 0.5 - Math.random()).slice(0, numPositions)

  return selectedStocks.map(stock => {
    const quantity = Math.floor(Math.random() * 100) + 10
    const averageCost = stock.type === 'crypto' 
      ? Math.random() * 50000 + 1000
      : Math.random() * 300 + 50
    const priceChange = (Math.random() - 0.4) * 0.3
    const currentPrice = averageCost * (1 + priceChange)
    const marketValue = quantity * currentPrice
    const totalCost = quantity * averageCost
    const totalReturn = marketValue - totalCost
    const totalReturnPercent = (totalReturn / totalCost) * 100

    return {
      symbol: stock.symbol,
      name: stock.name,
      type: stock.type,
      quantity,
      averageCost,
      currentPrice,
      marketValue,
      totalReturn,
      totalReturnPercent,
      importedFrom: accountId,
      lastUpdated: Date.now()
    }
  })
}
