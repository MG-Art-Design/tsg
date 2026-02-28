import { InsiderTrade } from './types'

export interface VettedInsight {
  id: string
  title: string
  analysis: string
  vetScore: number
  phase1Score: number
  phase2Score: number
  tradingSignals: TradingSignal[]
  assetRecommendations: AssetRecommendation[]
  keyPlayers: KeyPlayer[]
  patterns: TradingPattern[]
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
  timestamp: number
}

export interface TradingSignal {
  type: 'bullish' | 'bearish' | 'neutral'
  asset: string
  strength: number
  reasoning: string
  timeHorizon: '1-week' | '2-week' | '1-month' | '3-month'
}

export interface AssetRecommendation {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  category: 'highest-growth' | 'highest-volatility' | 'lowest-volatility' | 'consistent-performer' | 'underrated-genius'
  score: number
  reasoning: string
  backedByPlayers: string[]
}

export interface KeyPlayer {
  name: string
  category: 'congress' | 'whitehouse' | 'trump-family' | 'stephen-miller' | 'affiliate'
  recentActivity: string
  influence: number
  tradingPattern: 'aggressive' | 'cautious' | 'opportunistic'
}

export interface TradingPattern {
  pattern: string
  occurrences: number
  assets: string[]
  implication: string
}

export async function generateVettedInsight(trades: InsiderTrade[]): Promise<VettedInsight> {
  const phase1Data = await runPhase1Vetting(trades)
  const phase2Data = await runPhase2Vetting(trades, phase1Data)
  
  const combinedAnalysis = await synthesizeInsights(phase1Data, phase2Data, trades)
  
  return combinedAnalysis
}

async function runPhase1Vetting(trades: InsiderTrade[]): Promise<any> {
  const recentTrades = trades.slice(0, 20)
  
  const tradesByCategory = {
    congress: recentTrades.filter(t => t.category === 'congress'),
    whitehouse: recentTrades.filter(t => t.category === 'whitehouse'),
    trumpFamily: recentTrades.filter(t => t.category === 'trump-family')
  }

  const assetFrequency: Record<string, number> = {}
  const playerActivity: Record<string, { trades: number; volume: number; pattern: string[] }> = {}
  
  recentTrades.forEach(t => {
    assetFrequency[t.asset] = (assetFrequency[t.asset] || 0) + 1
    
    if (!playerActivity[t.trader]) {
      playerActivity[t.trader] = { trades: 0, volume: 0, pattern: [] }
    }
    playerActivity[t.trader].trades++
    playerActivity[t.trader].volume += t.value
    playerActivity[t.trader].pattern.push(t.action)
  })

  const hotAssets = Object.entries(assetFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([asset, count]) => ({ asset, count }))

  const majorPlayers = Object.entries(playerActivity)
    .sort(([,a], [,b]) => b.volume - a.volume)
    .slice(0, 15)
    .map(([name, data]) => ({ name, ...data }))

  const buySignals = recentTrades.filter(t => t.action === 'buy')
  const sellSignals = recentTrades.filter(t => t.action === 'sell')

  const promptText = `You are a Phase 1 vetting analyst for insider trading intelligence. Your job is to perform the FIRST PASS analysis of raw trading data.

PHASE 1 OBJECTIVE: Identify patterns, anomalies, and key players that warrant deeper investigation.

Trading Data Summary:
- Total trades analyzed: ${recentTrades.length}
- Congress activity: ${tradesByCategory.congress.length} trades
- White House activity: ${tradesByCategory.whitehouse.length} trades
- Trump Family activity: ${tradesByCategory.trumpFamily.length} trades
- Buy signals: ${buySignals.length} vs Sell signals: ${sellSignals.length}

Hot Assets (by frequency):
${hotAssets.map(h => `- ${h.asset}: ${h.count} trades`).join('\n')}

Major Players (by volume):
${majorPlayers.slice(0, 10).map(p => `- ${p.name}: ${p.trades} trades, $${(p.volume / 1000000).toFixed(1)}M volume, pattern: ${p.pattern.slice(-3).join('-')}`).join('\n')}

ANALYZE AND IDENTIFY:
1. Unusual clustering of trades around specific assets or sectors
2. Coordinated trading patterns across multiple players
3. High-conviction moves (large volume, repeated buys/sells)
4. Contradictory signals that need reconciliation
5. Players showing abnormal activity levels
6. Time-sensitive patterns (rapid succession of trades)

Return ONLY valid JSON with this structure:
{
  "flaggedAssets": ["Array of 5-10 assets requiring Phase 2 analysis with reasoning"],
  "keyPlayers": ["Array of 5-10 player names with influence scores and patterns"],
  "patterns": ["Array of 3-5 identified patterns worth investigating"],
  "anomalies": ["Array of 2-4 unusual behaviors or contradictions"],
  "phase1Score": number from 0-100 indicating data quality and signal strength,
  "recommendation": "Brief assessment for Phase 2 focus areas"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  return JSON.parse(response)
}

async function runPhase2Vetting(trades: InsiderTrade[], phase1Data: any): Promise<any> {
  const recentTrades = trades.slice(0, 20)
  
  const promptText = `You are a Phase 2 strategic vetting analyst. Phase 1 has identified key signals. Your job is DEEP ANALYSIS and STRATEGIC SYNTHESIS.

PHASE 2 OBJECTIVE: Extrapolate quiet hand analysis, identify winners/losers, and generate actionable intelligence.

Phase 1 Findings:
${JSON.stringify(phase1Data, null, 2)}

Recent Trade Details:
${recentTrades.slice(0, 15).map(t => 
  `- ${t.trader} (${t.category}): ${t.action.toUpperCase()} ${t.amount} of ${t.asset} (${t.assetType}) worth $${(t.value / 1000000).toFixed(2)}M`
).join('\n')}

DEEP ANALYSIS REQUIREMENTS:

1. CONGRESS MEMBER ANALYSIS:
   - Key congressional players and their positioning
   - Committee assignments relevant to their trades
   - Voting records that align with their positions
   
2. TRUMP FAMILY & AFFILIATES:
   - Trump family member activities and sectors of focus
   - Stephen Miller affiliated activity (if any)
   - Known business partners and their trades
   
3. QUIET HAND EXTRAPOLATION:
   - What are insiders NOT saying but clearly positioning for?
   - Which sectors are seeing stealth accumulation?
   - What macro events might these positions anticipate?

4. STRATEGIC ASSET CATEGORIZATION:
   Identify 3-5 assets in EACH category with ticker symbols:
   - HIGHEST GROWTH POTENTIAL (explosive upside plays)
   - HIGHEST VOLATILITY (swing trading opportunities)  
   - LOWEST VOLATILITY (safe harbor positions)
   - CONSISTENT PERFORMERS (reliable steady gains)
   - UNDERRATED GENIUS CHOICES (contrarian plays insiders know)

5. WINNERS & LOSERS:
   - Clear winner sectors/assets based on insider positioning
   - Clear loser sectors/assets based on insider exits
   - Timeline expectations (1-week, 2-week, 1-month, 3-month)

6. TRADING SIGNALS:
   Generate 5-7 specific trading signals with:
   - Bullish/Bearish/Neutral designation
   - Asset ticker
   - Signal strength (0-100)
   - Time horizon
   - Reasoning based on insider activity

Return ONLY valid JSON with this structure:
{
  "keyPlayers": [
    {
      "name": "string",
      "category": "congress|whitehouse|trump-family|stephen-miller|affiliate",
      "influence": number 0-100,
      "recentActivity": "description",
      "tradingPattern": "aggressive|cautious|opportunistic"
    }
  ],
  "assetRecommendations": [
    {
      "symbol": "TICKER",
      "name": "Full Name",
      "type": "stock|crypto",
      "category": "highest-growth|highest-volatility|lowest-volatility|consistent-performer|underrated-genius",
      "score": number 0-100,
      "reasoning": "why insiders like this",
      "backedByPlayers": ["player names"]
    }
  ],
  "tradingSignals": [
    {
      "type": "bullish|bearish|neutral",
      "asset": "TICKER",
      "strength": number 0-100,
      "reasoning": "insider activity basis",
      "timeHorizon": "1-week|2-week|1-month|3-month"
    }
  ],
  "patterns": [
    {
      "pattern": "description",
      "occurrences": number,
      "assets": ["tickers"],
      "implication": "what this means"
    }
  ],
  "quietHandAnalysis": "2-3 paragraph deep read on what insiders are positioning for that isn't obvious",
  "phase2Score": number 0-100 indicating confidence in analysis,
  "strategicSummary": "2-3 paragraph synthesis of key findings"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  return JSON.parse(response)
}

async function synthesizeInsights(phase1Data: any, phase2Data: any, trades: InsiderTrade[]): Promise<VettedInsight> {
  const vetScore = Math.round((phase1Data.phase1Score + phase2Data.phase2Score) / 2)
  
  const promptText = `You are the final synthesis analyst for TSG: The Stonk Game. You have vetted intelligence from Phase 1 and Phase 2. Create a BOLD, ACTIONABLE insight for users.

Phase 1 Score: ${phase1Data.phase1Score}/100
Phase 2 Score: ${phase2Data.phase2Score}/100
Combined Vet Score: ${vetScore}/100

Phase 1 Summary:
${phase1Data.recommendation}

Phase 2 Strategic Summary:
${phase2Data.strategicSummary}

Quiet Hand Analysis:
${phase2Data.quietHandAnalysis}

YOUR JOB: Write a compelling 3-4 paragraph analysis with TSG's signature sassy-but-smart personality that:
1. Opens with a hook about what's REALLY happening in the market
2. Explains the key insider positioning with specifics (names, amounts, assets)
3. Reveals the quiet hand - what insiders know that the market doesn't
4. Closes with strategic implications and what players should watch

Tone: Bold, confident, slightly sassy, but substantive. Like a trader who knows the game.

Also create a punchy title (10-15 words) that captures the essence.

Determine risk level (low/medium/high) based on signal clarity and confidence (60-95%) based on data quality.

Return ONLY valid JSON:
{
  "title": "Bold title here",
  "analysis": "Full 3-4 paragraph analysis with personality",
  "riskLevel": "low|medium|high",
  "confidence": number 60-95
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const synthesis = JSON.parse(response)

  return {
    id: Date.now().toString(),
    title: synthesis.title,
    analysis: synthesis.analysis,
    vetScore,
    phase1Score: phase1Data.phase1Score,
    phase2Score: phase2Data.phase2Score,
    tradingSignals: phase2Data.tradingSignals,
    assetRecommendations: phase2Data.assetRecommendations,
    keyPlayers: phase2Data.keyPlayers,
    patterns: phase2Data.patterns,
    riskLevel: synthesis.riskLevel,
    confidence: synthesis.confidence,
    timestamp: Date.now()
  }
}

export function generateMockInsiderTrades(): InsiderTrade[] {
  const traders = [
    { name: 'Nancy Pelosi', category: 'congress' as const, title: 'Speaker Emerita' },
    { name: 'Kevin McCarthy', category: 'congress' as const, title: 'House Leader' },
    { name: 'Mitch McConnell', category: 'congress' as const, title: 'Senate Leader' },
    { name: 'Chuck Schumer', category: 'congress' as const, title: 'Senate Majority Leader' },
    { name: 'Marjorie Taylor Greene', category: 'congress' as const, title: 'Representative' },
    { name: 'Donald Trump Jr.', category: 'trump-family' as const, title: 'Trump Org Executive' },
    { name: 'Eric Trump', category: 'trump-family' as const, title: 'Trump Org EVP' },
    { name: 'Jared Kushner', category: 'trump-family' as const, title: 'Senior Advisor' },
    { name: 'Ivanka Trump', category: 'trump-family' as const, title: 'Former Advisor' },
    { name: 'Stephen Miller', category: 'whitehouse' as const, title: 'Senior Advisor' },
    { name: 'Mike Pompeo', category: 'whitehouse' as const, title: 'Former Secretary' },
    { name: 'Steve Mnuchin', category: 'whitehouse' as const, title: 'Former Treasury Sec' }
  ]

  const stocks = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'stock' as const },
    { symbol: 'TSLA', name: 'Tesla Inc', type: 'stock' as const },
    { symbol: 'MSFT', name: 'Microsoft Corp', type: 'stock' as const },
    { symbol: 'AAPL', name: 'Apple Inc', type: 'stock' as const },
    { symbol: 'META', name: 'Meta Platforms', type: 'stock' as const },
    { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'stock' as const },
    { symbol: 'AMZN', name: 'Amazon.com Inc', type: 'stock' as const },
    { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock' as const },
    { symbol: 'BAC', name: 'Bank of America', type: 'stock' as const },
    { symbol: 'V', name: 'Visa Inc', type: 'stock' as const },
    { symbol: 'DIS', name: 'Walt Disney Co', type: 'stock' as const },
    { symbol: 'XOM', name: 'Exxon Mobil', type: 'stock' as const },
    { symbol: 'PFE', name: 'Pfizer Inc', type: 'stock' as const },
    { symbol: 'NFLX', name: 'Netflix Inc', type: 'stock' as const },
    { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock' as const },
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' as const },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto' as const },
    { symbol: 'SOL', name: 'Solana', type: 'crypto' as const },
    { symbol: 'AVAX', name: 'Avalanche', type: 'crypto' as const }
  ]

  const trades: InsiderTrade[] = []
  const now = Date.now()

  for (let i = 0; i < 35; i++) {
    const trader = traders[Math.floor(Math.random() * traders.length)]
    const asset = stocks[Math.floor(Math.random() * stocks.length)]
    const action = Math.random() > 0.4 ? 'buy' : 'sell'
    const value = Math.floor(Math.random() * 5000000) + 50000
    const daysAgo = Math.floor(Math.random() * 14)
    const disclosureDaysAgo = Math.max(0, daysAgo - Math.floor(Math.random() * 7))

    const amounts = [
      '100-500 shares',
      '500-1,000 shares',
      '1,000-5,000 shares',
      '5,000-15,000 shares',
      '15,000-50,000 shares',
      '0.1-1 BTC',
      '1-5 BTC',
      '10-50 ETH',
      '100-500 SOL',
      'Options contracts'
    ]

    trades.push({
      id: `trade-${i}-${Date.now()}`,
      trader: trader.name,
      title: trader.title,
      category: trader.category,
      asset: asset.symbol,
      assetType: asset.type === 'crypto' ? 'crypto' : (Math.random() > 0.7 ? 'option' : 'stock'),
      action: action as 'buy' | 'sell',
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      value,
      disclosureDate: now - (disclosureDaysAgo * 24 * 60 * 60 * 1000),
      tradeDate: now - (daysAgo * 24 * 60 * 60 * 1000),
      source: trader.category === 'congress' ? 'Senate Disclosure' : 'Public Filing'
    })
  }

  return trades.sort((a, b) => b.disclosureDate - a.disclosureDate)
}
