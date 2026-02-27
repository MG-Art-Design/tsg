import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Onboarding } from '@/components/Onboarding'
import { Dashboard } from '@/components/Dashboard'
import { PortfolioManager } from '@/components/PortfolioManager'
import { Leaderboard } from '@/components/Leaderboard'
import { Insights } from '@/components/Insights'
import { Groups } from '@/components/Groups'
import { UserProfile, Portfolio, Asset, PortfolioPosition, LeaderboardEntry, Insight } from '@/lib/types'
import { 
  generateMockMarketData, 
  getCurrentQuarter, 
  INITIAL_PORTFOLIO_VALUE,
  calculatePortfolioValue
} from '@/lib/helpers'
import { ChartLine, Lightning, Trophy, Notebook, User, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  const [profile, setProfile] = useKV<UserProfile | null>('user-profile', null)
  const [portfolio, setPortfolio] = useKV<Portfolio | null>('user-portfolio', null)
  const [insights, setInsights] = useKV<Insight[]>('user-insights', [])
  const [allPortfolios, setAllPortfolios] = useKV<Record<string, Portfolio>>('all-portfolios', {})
  const [allUsers, setAllUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [marketData, setMarketData] = useState<Asset[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const data = generateMockMarketData()
    setMarketData(data)

    const interval = setInterval(() => {
      setMarketData(currentData =>
        currentData.map(asset => {
          const volatility = asset.type === 'crypto' ? 0.03 : 0.01
          const change = (Math.random() - 0.5) * volatility
          const newPrice = asset.currentPrice * (1 + change)
          const priceChange = newPrice - asset.currentPrice
          const priceChangePercent = (priceChange / asset.currentPrice) * 100

          return {
            ...asset,
            currentPrice: newPrice,
            priceChange24h: priceChange,
            priceChangePercent24h: priceChangePercent
          }
        })
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (portfolio && marketData.length > 0) {
      const updatedPositions: PortfolioPosition[] = portfolio.positions.map(pos => {
        const currentAsset = marketData.find(a => a.symbol === pos.symbol)
        if (!currentAsset) return pos

        const shares = (pos.allocation / 100) * INITIAL_PORTFOLIO_VALUE / pos.entryPrice
        const value = shares * currentAsset.currentPrice
        const returnValue = value - (pos.allocation / 100) * INITIAL_PORTFOLIO_VALUE
        const returnPercent = (returnValue / ((pos.allocation / 100) * INITIAL_PORTFOLIO_VALUE)) * 100

        return {
          ...pos,
          currentPrice: currentAsset.currentPrice,
          shares,
          value,
          returnValue,
          returnPercent
        }
      })

      const { currentValue, totalReturn, totalReturnPercent } = calculatePortfolioValue(
        updatedPositions,
        INITIAL_PORTFOLIO_VALUE
      )

      setPortfolio(current => current ? {
        ...current,
        positions: updatedPositions,
        currentValue,
        totalReturn,
        totalReturnPercent,
        lastUpdated: Date.now()
      } : null)
    }
  }, [marketData, portfolio?.positions.length])

  useEffect(() => {
    if (profile && insights && insights.length === 0) {
      generateInitialInsights()
    }
  }, [profile, insights])

  const generateInitialInsights = async () => {
    const welcomeInsights: Insight[] = [
      {
        id: Date.now().toString(),
        userId: profile!.id,
        content: `Welcome to TSG: The Stonk Game, ${profile!.username}! 🎉 Time to show your friends what you're made of. Build your portfolio, take some risks, and let's see who comes out on top this quarter. Remember: fortune favors the bold... but also the informed.`,
        category: 'portfolio-tip',
        timestamp: Date.now(),
        read: false
      },
      {
        id: (Date.now() + 1).toString(),
        userId: profile!.id,
        content: `Market's looking spicy today 🌶️ Tech stocks are showing strength while crypto's doing its usual rollercoaster thing. Don't put all your eggs in one basket... unless you're feeling lucky. Your call, champ.`,
        category: 'market-trend',
        timestamp: Date.now() - 3600000,
        read: false
      }
    ]

    setInsights(() => welcomeInsights)
  }

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile)
    toast.success(`Welcome aboard, ${newProfile.username}!`, {
      description: 'Time to build your first portfolio and show everyone what you\'ve got.'
    })
  }

  const handlePortfolioSave = (
    positions: Array<{ symbol: string; name: string; type: 'stock' | 'crypto'; allocation: number }>
  ) => {
    const currentQuarter = getCurrentQuarter()
    
    const portfolioPositions: PortfolioPosition[] = positions.map(pos => {
      const asset = marketData.find(a => a.symbol === pos.symbol)!
      const shares = (pos.allocation / 100) * INITIAL_PORTFOLIO_VALUE / asset.currentPrice
      const value = shares * asset.currentPrice

      return {
        symbol: pos.symbol,
        name: pos.name,
        type: pos.type,
        allocation: pos.allocation,
        entryPrice: asset.currentPrice,
        currentPrice: asset.currentPrice,
        shares,
        value,
        returnPercent: 0,
        returnValue: 0
      }
    })

    const newPortfolio: Portfolio = {
      userId: profile!.id,
      quarter: currentQuarter,
      positions: portfolioPositions,
      initialValue: INITIAL_PORTFOLIO_VALUE,
      currentValue: INITIAL_PORTFOLIO_VALUE,
      totalReturn: 0,
      totalReturnPercent: 0,
      lastUpdated: Date.now()
    }

    setPortfolio(newPortfolio)
    setActiveTab('dashboard')

    setAllPortfolios(current => ({
      ...(current || {}),
      [profile!.id]: newPortfolio
    }))

    const newInsight: Insight = {
      id: Date.now().toString(),
      userId: profile!.id,
      content: `Portfolio locked in! You're holding ${positions.length} positions across ${positions.filter(p => p.type === 'stock').length} stocks and ${positions.filter(p => p.type === 'crypto').length} crypto. Bold moves. Let's see if they pay off! 💰`,
      category: 'portfolio-tip',
      timestamp: Date.now(),
      read: false
    }

    setInsights((current) => [newInsight, ...(current || [])])
  }

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setProfile(updatedUser)
    setAllUsers(current => ({
      ...(current || {}),
      [updatedUser.id]: updatedUser
    }))
  }

  useEffect(() => {
    if (profile) {
      setAllUsers(current => ({
        ...(current || {}),
        [profile.id]: profile
      }))
    }
  }, [profile?.id])

  useEffect(() => {
    if (portfolio && profile) {
      setAllPortfolios(current => ({
        ...(current || {}),
        [profile.id]: portfolio
      }))
    }
  }, [portfolio?.lastUpdated, profile?.id])

  const mockLeaderboard: LeaderboardEntry[] = portfolio ? [
    {
      userId: profile!.id,
      username: profile!.username,
      avatar: profile!.avatar,
      returnPercent: portfolio.totalReturnPercent,
      returnValue: portfolio.totalReturn,
      rank: 1,
      portfolioValue: portfolio.currentValue
    }
  ] : []

  if (!profile) {
    return (
      <>
        <Onboarding onComplete={handleProfileComplete} />
        <Toaster richColors position="top-right" />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                TSG: The Stonk Game
              </h1>
              <p className="text-sm text-muted-foreground">
                {getCurrentQuarter()} • {profile.username}
              </p>
            </div>
            <div className="text-4xl">{profile.avatar}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ChartLine size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Lightning size={18} weight="fill" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy size={18} weight="fill" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users size={18} weight="fill" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Notebook size={18} />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard portfolio={portfolio ?? null} marketData={marketData} />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioManager
              currentPortfolio={portfolio ?? null}
              marketData={marketData}
              onSave={handlePortfolioSave}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard entries={mockLeaderboard} currentUserId={profile.id} currentUser={profile} />
          </TabsContent>

          <TabsContent value="groups">
            <Groups currentUser={profile} onUserUpdate={handleUserUpdate} />
          </TabsContent>

          <TabsContent value="insights">
            <Insights insights={insights ?? []} />
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{profile.avatar}</div>
                <h2 className="text-3xl font-bold mb-2">{profile.username}</h2>
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}
                <div className="text-sm text-muted-foreground">
                  Insights frequency: <span className="capitalize font-medium">{profile.insightFrequency}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  )
}

export default App