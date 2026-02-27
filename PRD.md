# TSG: The Stonk Game - Planning Guide

A virtual trading competition platform where friends compete in quarterly S&P 500 and crypto prediction challenges, tracking performance, sharing achievements, and enjoying friendly rivalry through paper trading.

**Experience Qualities**:
1. **Playfully Competitive** - The app encourages friendly rivalry with sassy commentary and leaderboards that motivate users to take bold moves
2. **Intelligently Informed** - Real market data powers insights and trend analysis delivered at user-preferred frequencies to keep players educated
3. **Intimately Social** - Personalized profiles, performance updates, and competitive standings create a tight-knit community experience

**Complexity Level**: **Complex Application** (advanced functionality, likely with multiple views)
This app requires multiple interconnected features including user profiles, real-time market data visualization, performance tracking systems, leaderboard calculations, quarterly competition cycles, personalized AI-generated insights, and a sophisticated state management system across different views.

## Essential Features

### User Profile Creation & Management
- **Functionality**: Create custom profiles with avatar upload (or emoji selection), username, bio, and notification preferences
- **Purpose**: Establishes personal identity within the competitive space and allows preference customization
- **Trigger**: First-time app load or clicking profile settings
- **Progression**: Welcome screen → Profile creation form → Avatar selection → Bio entry → Notification preferences → Dashboard
- **Success criteria**: Profile persists across sessions, displays correctly on leaderboards, preferences control notification frequency

### Quarterly Trading Competitions
- **Functionality**: Virtual trading rounds where users select S&P 500 stocks or crypto assets, allocate virtual capital, and compete for best returns
- **Purpose**: Creates structured competition cycles with clear winners and fresh starts
- **Trigger**: Automatic quarterly cycle (Q1-Q4), or manual entry for new users mid-quarter
- **Progression**: Quarter start → Portfolio allocation ($10k virtual) → Daily/weekly tracking → Quarter end → Winner announcement → Reset for next quarter
- **Success criteria**: Correctly calculates returns based on real market data, declares winners, archives past performance

### Live Market Dashboard
- **Functionality**: Real-time view of S&P 500 and top crypto assets with price changes, trends, and portfolio performance
- **Purpose**: Keeps players informed and engaged with current market conditions affecting their virtual positions
- **Trigger**: Dashboard navigation or app load
- **Progression**: Load dashboard → Display portfolio positions → Show market movers → Highlight personal performance → Enable trade adjustments
- **Success criteria**: Market data reflects actual trends, portfolio values update correctly, performance metrics are accurate

### AI-Generated Market Insights
- **Functionality**: Personalized market analysis with sassy, encouraging tone delivered daily/weekly/monthly based on user preference
- **Purpose**: Educates users on market trends while maintaining engaging personality and encouraging strategic risk-taking
- **Trigger**: Scheduled based on user preference (daily at 9am, weekly Monday, monthly 1st)
- **Progression**: Market data fetch → AI analysis generation → Personalization for user's portfolio → Delivery to insights feed → Optional share to friends
- **Success criteria**: Insights are relevant to current market conditions, tone is consistent (sassy yet respectful), delivery matches preferences

### Performance Leaderboard & Standings
- **Functionality**: Real-time rankings showing all competitors' returns, with filters for daily/weekly/monthly/quarterly performance
- **Purpose**: Fuels competition, celebrates winners, and motivates strategic improvement
- **Trigger**: Leaderboard tab navigation
- **Progression**: Open leaderboard → View rankings → Filter by timeframe → See detailed returns → Click user for profile view
- **Success criteria**: Rankings are accurate and update in real-time, percentage returns calculated correctly, historical data preserved

### Portfolio Management
- **Functionality**: Allocate virtual $10k across S&P 500 stocks and crypto, rebalance positions, track value changes
- **Purpose**: Core mechanic for competition - players make strategic choices and live with consequences
- **Trigger**: "Manage Portfolio" button from dashboard
- **Progression**: View current positions → Search assets → Allocate percentage → Confirm changes → See updated portfolio value
- **Success criteria**: Allocations total 100%, changes persist, portfolio value tracks market accurately, trade history logged

## Edge Case Handling

- **Mid-Quarter Joiners**: New users joining mid-quarter receive prorated virtual capital and compete in a "rookie league" until next quarter starts
- **Inactive Portfolios**: Users who don't trade maintain last allocation; inactive for full quarter results in notification and auto-bench for rankings
- **Market Data Failures**: Cached last-known prices displayed with warning banner; insights paused until data restored
- **Tied Leaderboard Positions**: Ties broken by earliest trade timestamp or split ranking (both shown as #1)
- **Invalid Portfolio Allocations**: Real-time validation prevents over-allocation; shows error with current total percentage
- **Extreme Market Volatility**: Circuit breaker warnings displayed; no actual money at risk so maintains all positions

## Design Direction

The design should evoke the excitement of a high-stakes casino mixed with the refinement of a premium financial terminal—dark, sleek, and energetic. Think neon accents against deep backgrounds, sharp geometric shapes, and confident typography that whispers "take the risk." The interface should feel like a secret society for ambitious friends, where making bold moves is celebrated and losses are learning opportunities wrapped in humor.

## Color Selection

A dark, sophisticated palette with vibrant neon accents that pop against the shadows—evoking both late-night trading floors and exclusive gaming lounges.

- **Primary Color**: Neon Cyan (oklch(0.75 0.15 195)) - Electric, attention-grabbing, represents upward momentum and winning positions. Used for primary actions and positive performance indicators.
- **Secondary Colors**: 
  - Deep Charcoal Background (oklch(0.15 0.01 240)) - Rich, almost-black base that makes neon colors sing
  - Slate Surface (oklch(0.22 0.015 240)) - Slightly lighter panels for cards and surfaces
  - Muted Purple (oklch(0.45 0.12 290)) - Supporting color for secondary actions and neutral states
- **Accent Color**: Hot Magenta (oklch(0.65 0.24 330)) - Electric pink for CTAs, winning streaks, and risky moves that paid off. Impossible to ignore.
- **Supporting Colors**:
  - Neon Green (oklch(0.75 0.18 145)) - Gains, positive returns, upward trends
  - Electric Red (oklch(0.60 0.22 25)) - Losses, negative returns, warnings
  - Amber Warning (oklch(0.70 0.15 70)) - Caution states, pending actions
- **Foreground/Background Pairings**: 
  - Primary Cyan (oklch(0.75 0.15 195)): Deep Charcoal background (oklch(0.15 0.01 240)) - Ratio 6.2:1 ✓
  - Hot Magenta (oklch(0.65 0.24 330)): Deep Charcoal background (oklch(0.15 0.01 240)) - Ratio 5.1:1 ✓
  - White text (oklch(0.98 0 0)): Deep Charcoal (oklch(0.15 0.01 240)) - Ratio 13.8:1 ✓
  - White text (oklch(0.98 0 0)): Slate Surface (oklch(0.22 0.015 240)) - Ratio 10.5:1 ✓
  - Neon Green (oklch(0.75 0.18 145)): Deep Charcoal - Ratio 6.5:1 ✓

## Font Selection

Typography should feel confident, modern, and slightly aggressive—like the voice of a savvy trader who's seen it all but still loves the game.

- **Primary Font**: "Space Grotesk" - A geometric sans-serif with technical precision and distinctive character, perfect for the app's modern, competitive personality. Used for headlines, numbers, and emphasis.
- **Secondary Font**: "Inter" - Clean, highly legible for body text and data tables, ensures readability without sacrificing style.

**Typographic Hierarchy**:
- H1 (App Title/Section Headers): Space Grotesk Bold / 32px / -0.02em tracking / line-height 1.1
- H2 (Card Titles): Space Grotesk SemiBold / 24px / -0.01em tracking / line-height 1.2
- H3 (Subsections): Space Grotesk Medium / 18px / normal tracking / line-height 1.3
- Body (Standard Text): Inter Regular / 15px / normal tracking / line-height 1.5
- Small (Metadata/Labels): Inter Medium / 13px / 0.01em tracking / line-height 1.4
- Numbers/Stats: Space Grotesk Bold / 28px / -0.02em tracking / Tabular nums
- Captions: Inter Regular / 12px / normal tracking / line-height 1.3

## Animations

Animations should feel electric and responsive—quick snaps for interactions, smooth flows for transitions, and celebratory flourishes for wins. Think arcade game feedback mixed with premium app polish: buttons pulse on hover, numbers count up dramatically when gains appear, cards slide in with subtle parallax, and winning positions get a brief neon glow. Avoid sluggishness—everything should feel instantaneous and energetic, matching the pace of market movements.

## Component Selection

- **Components**: 
  - Navigation: Tabs for main sections (Dashboard, Portfolio, Leaderboard, Insights, Profile)
  - Dashboard: Card components for portfolio summary, market movers, recent insights
  - Portfolio Manager: Table for holdings with editable percentage inputs, Dialog for trade confirmation
  - Leaderboard: Table with Avatar, ranking badges, sortable columns
  - Insights Feed: Scrollable Card list with timestamp, category badges
  - Profile: Avatar with upload/emoji picker, Input fields for username/bio, Switch components for notification preferences
  - Market Data: Custom chart components with D3 for price history
  - Toasts (Sonner): Trade confirmations, insight deliveries, competition updates
  
- **Customizations**: 
  - Custom ranking badge component with gradient borders and glow effects
  - Animated percentage change indicators with color-coded arrows
  - Custom market ticker component with scrolling prices
  - Profile avatar component supporting both uploaded images and emoji selection
  - Custom insight card with AI-generated content and sassy tone indicators (emoji reactions)
  
- **States**: 
  - Buttons: Default with subtle glow, hover with brightness increase and scale 1.02, active with press down, disabled with 40% opacity
  - Inputs: Default with neon border-bottom, focus with full neon border and subtle glow, error with red border pulse
  - Cards: Default elevated shadow, hover with increased elevation and border glow
  - Trade buttons: Pulse animation when market is volatile, success state with green flash
  
- **Icon Selection**: 
  - TrendUp/TrendDown: Portfolio performance indicators
  - ChartLine: Market data and insights
  - Trophy: Leaderboard and winners
  - User/UserCircle: Profile and user management
  - Lightning: AI insights and quick actions
  - ArrowsClockwise: Refresh market data
  - Coins: Crypto assets
  - ChartBar: S&P 500 stocks
  - Bell: Notifications
  - Gear: Settings
  
- **Spacing**: 
  - Container padding: p-6 (24px) on desktop, p-4 (16px) on mobile
  - Card gaps: gap-6 for dashboard grid
  - Element spacing: space-y-4 for stacked elements, gap-2 for inline groups
  - Section margins: mb-8 between major sections
  - Table cells: px-4 py-3
  
- **Mobile**: 
  - Tabs collapse to bottom navigation bar with icons only
  - Dashboard cards stack vertically instead of grid
  - Leaderboard table shows abbreviated columns (rank, avatar, name, % return only)
  - Portfolio manager switches from table to card-based list
  - Charts reduce height and show simplified view
  - Insights cards maintain full width with comfortable padding
  - Profile editor stacks fields vertically
  - Font sizes reduce slightly (H1 to 28px, body to 14px) for better mobile readability
