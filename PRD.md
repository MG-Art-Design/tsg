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
- **Functionality**: Real-time rankings showing only friends' returns, creating an intimate competition space with your chosen rivals
- **Purpose**: Fuels personal competition with friends, celebrates winners in your circle, and motivates strategic improvement
- **Trigger**: Leaderboard tab navigation
- **Progression**: Open leaderboard → View friend rankings → See detailed returns → Add more friends to expand competition
- **Success criteria**: Rankings show only added friends, updates in real-time, percentage returns calculated correctly, empty state prompts friend adding

### Friend Management System
- **Functionality**: Add friends via unique friend code, creating bilateral connections that sync both users to each other's leaderboards
- **Purpose**: Enables users to build their personal competition circle with chosen rivals, keeping competitions intimate and meaningful
- **Trigger**: "Add Friend" button in Profile tab or empty leaderboard state
- **Progression**: Click add friend → Enter friend's unique code → Confirmation → Friend appears on both leaderboards → Compete together
- **Success criteria**: Friend codes are unique per user, adding friend syncs both users, friends appear on each other's leaderboards, can remove friends bilaterally

### Portfolio Management
- **Functionality**: Allocate virtual $10k across S&P 500 stocks and crypto, rebalance positions, track value changes
- **Purpose**: Core mechanic for competition - players make strategic choices and live with consequences
- **Trigger**: "Manage Portfolio" button from dashboard
- **Progression**: View current positions → Search assets → Allocate percentage → Confirm changes → See updated portfolio value
- **Success criteria**: Allocations total 100%, changes persist, portfolio value tracks market accurately, trade history logged

### Email Notification System
- **Functionality**: Automated email delivery of performance summaries, leaderboard updates, market insights, and portfolio changes based on user-selected frequency (daily/weekly/monthly)
- **Purpose**: Keeps users engaged without requiring constant app checks; delivers personalized performance updates directly to inbox
- **Trigger**: User enables email notifications in profile settings with specified frequency and content preferences
- **Progression**: Enable in settings → Set email & frequency → Select content types (leaderboard/market/insights) → Receive scheduled updates → Email contains formatted HTML with portfolio performance, rankings, and AI insights
- **Success criteria**: Emails sent at correct intervals, content respects user preferences, HTML formatting displays correctly, emails include current rankings and accurate portfolio data

### Insider Trading Intelligence Feed ("Stonk: Omg It's In")
- **Functionality**: Displays publicly disclosed insider trades from Congress members, White House officials, and Trump family/partners, updated every 12 hours with filtering by category
- **Purpose**: Provides competitive intelligence on high-profile trades to inform user investment strategies and add intrigue to the competition
- **Trigger**: Automatically displayed on Dashboard; data refreshes every 12 hours
- **Progression**: Load Dashboard → View "Stonk: Omg It's In" section → Filter by category (All/Congress/White House/Trump Family) → Review trade details (trader, asset, action, value, dates) → Use intelligence for portfolio decisions
- **Success criteria**: Data updates every 12 hours, displays accurate trade information, filters work correctly, distinctive black-gold styling sets section apart visually, maintains monochromatic design consistency

### Strategic Positioning AI ("Stonk: Omg It's In" Analysis)
- **Functionality**: AI-powered analysis of insider trading patterns that generates strategic market insights with hypothesized future moves and risk assessments
- **Purpose**: Transforms raw insider trading data into actionable intelligence, helping users understand market signals and position their portfolios strategically
- **Trigger**: User clicks "Generate Insight" button in Strategic Positioning AI card on Dashboard
- **Progression**: Click Generate → AI analyzes recent insider trades → Generates insight with title, analysis paragraphs, signals to watch, hypothesized moves, risk level, and confidence score → Display formatted insight with black-gold styling → Option to refresh for new perspective
- **Success criteria**: Insights are contextually relevant to current insider trades, analysis has personality (sassy but strategic), risk levels and confidence scores make sense, hypothesized moves are actionable, maintains black-gold design theme

## Edge Case Handling

- **Mid-Quarter Joiners**: New users joining mid-quarter receive prorated virtual capital and compete in a "rookie league" until next quarter starts
- **Inactive Portfolios**: Users who don't trade maintain last allocation; inactive for full quarter results in notification and auto-bench for rankings
- **Market Data Failures**: Cached last-known prices displayed with warning banner; insights paused until data restored
- **Tied Leaderboard Positions**: Ties broken by earliest trade timestamp or split ranking (both shown as #1)
- **Invalid Portfolio Allocations**: Real-time validation prevents over-allocation; shows error with current total percentage
- **Extreme Market Volatility**: Circuit breaker warnings displayed; no actual money at risk so maintains all positions
- **Email Delivery Failures**: Emails queued locally and marked for retry; users see notification status in profile settings
- **Disabled Email Notifications**: Users without email enabled still receive in-app insights; email preferences can be toggled anytime
- **Invalid Email Addresses**: Email validation on input; error message shown if address format is incorrect
- **Insider Trade Data Unavailable**: If 12-hour scrape fails, display last known data with timestamp; show "Data updating..." message in header
- **Empty Insider Trade Categories**: When filtering shows no results, display friendly empty state with sparkle icon and explanatory message
- **AI Insight Generation Failures**: If LLM call fails, show error toast with retry option; previous insights remain visible
- **No Trades Available for Analysis**: Generate Insight button disabled with tooltip explaining data needed; empty state shown in Strategic Positioning AI card

## Design Direction

The design should evoke sophistication and focus—a refined, monochromatic aesthetic that feels like a private trading terminal for serious competitors. Deep charcoal backgrounds with subtle blue-gray accents create a calm, focused environment where data takes center stage. The interface should feel like an exclusive club where strategy matters more than flash, and bold moves are celebrated with elegant restraint.

**Brand Identity:** The logo features hollow, outlined "STONK GAME" typography in the Playfair Display serif font with an ascending chart arrow cutting diagonally across—symbolizing upward momentum and market gains. This outlined, monochromatic treatment creates a refined, sophisticated appearance that integrates seamlessly with the dark background. The ascending line motif is extrapolated throughout: subtle chart patterns in card backgrounds, animated rising indicators, and gradient flows that echo stock trajectories.

## Color Selection

A sophisticated monochromatic palette built around blue-grays with minimal saturation—evoking calm focus, analytical precision, and professional trading terminals. The "Stonk: Omg It's In" insider trading section uses a distinctive black-gold color scheme that stands apart while maintaining the overall monochromatic design language.

- **Primary Color**: Cool Steel Blue (oklch(0.72 0.06 210)) - Subtle, refined, represents clarity and upward momentum. Used for primary actions and positive performance indicators with restraint.
- **Secondary Colors**: 
  - Deep Charcoal Background (oklch(0.15 0.01 240)) - Rich, almost-black base that provides excellent contrast
  - Slate Surface (oklch(0.19 0.015 240)) - Slightly lighter panels for cards and surfaces
  - Muted Blue-Gray (oklch(0.38 0.04 240)) - Supporting color for secondary actions and neutral states
- **Accent Color**: Light Steel (oklch(0.68 0.08 220)) - Subtle blue-gray highlight for CTAs and important elements. Refined and understated.
- **Black-Gold Accent (Insider Trading Section)**: 
  - Rich Gold (oklch(0.70 0.14 75)) - Luxurious gold for text and key elements in insider trading section
  - Deep Black (oklch(0.05 0.008 70)) - Nearly pure black background creating premium contrast
  - Gold Glow (oklch(0.65 0.12 75)) - Softer gold for borders and glowing effects
- **Supporting Colors**:
  - Muted Green (oklch(0.70 0.12 145)) - Gains, positive returns, upward trends (desaturated)
  - Muted Red (oklch(0.58 0.18 25)) - Losses, negative returns, warnings (desaturated)
- **Foreground/Background Pairings**: 
  - Primary Steel Blue (oklch(0.72 0.06 210)): Deep Charcoal background (oklch(0.15 0.01 240)) - Ratio 6.2:1 ✓
  - Light Steel (oklch(0.68 0.08 220)): Deep Charcoal background (oklch(0.15 0.01 240)) - Ratio 5.5:1 ✓
  - Light text (oklch(0.92 0.01 240)): Deep Charcoal (oklch(0.15 0.01 240)) - Ratio 11.2:1 ✓
  - Light text (oklch(0.92 0.01 240)): Slate Surface (oklch(0.19 0.015 240)) - Ratio 8.8:1 ✓
  - Muted Green (oklch(0.70 0.12 145)): Deep Charcoal - Ratio 5.8:1 ✓
  - Rich Gold (oklch(0.70 0.14 75)): Deep Black (oklch(0.05 0.008 70)) - Ratio 13.5:1 ✓

## Font Selection

Typography should feel sophisticated, classical, and authoritative—like the voice of an old-money trader who knows the game inside and out. The Times New Roman-esque serif fonts bring gravitas and refinement while maintaining the competitive edge.

- **Primary Font**: "Playfair Display" - An elegant high-contrast serif with traditional authority and sophisticated character, perfect for headlines, numbers, and establishing the app's refined, classic personality.
- **Secondary Font**: "Crimson Pro" - A graceful text serif optimized for readability, ensures comfort in body text and data tables without sacrificing the classical aesthetic.

**Typographic Hierarchy**:
- H1 (App Title/Section Headers): Playfair Display Bold / 32px / -0.01em tracking / line-height 1.2
- H2 (Card Titles): Playfair Display SemiBold / 24px / normal tracking / line-height 1.3
- H3 (Subsections): Playfair Display Medium / 18px / normal tracking / line-height 1.4
- Body (Standard Text): Crimson Pro Regular / 16px / normal tracking / line-height 1.6
- Small (Metadata/Labels): Crimson Pro Medium / 14px / normal tracking / line-height 1.5
- Numbers/Stats: Playfair Display Bold / 28px / -0.01em tracking / Tabular nums
- Captions: Crimson Pro Regular / 13px / normal tracking / line-height 1.4

## Animations

Animations should feel electric and responsive—quick snaps for interactions, smooth flows for transitions, and celebratory flourishes for wins. Think arcade game feedback mixed with premium app polish: buttons pulse on hover, numbers count up dramatically when gains appear, cards slide in with subtle parallax, and winning positions get a brief neon glow. Avoid sluggishness—everything should feel instantaneous and energetic, matching the pace of market movements.

## Component Selection

- **Components**: 
  - Logo: Custom SVG component with animated ascending chart line and gradient text (variants: sm, md, lg, xl)
  - BrandElements: ChartPattern (decorative background motifs), BrandBadge (category/status indicators), StatCard (metrics display with trend patterns), BrandDivider (gradient section separators)
  - Navigation: Tabs for main sections (Dashboard, Portfolio, Leaderboard, Groups, Insights, Profile)
  - Dashboard: Card components for portfolio summary, market movers, recent insights, and "Stonk: Omg It's In" insider trades section
  - InsiderTrades: Distinctive black-gold themed card with category filters (All/Congress/White House/Trump Family), animated trade entries with buy/sell badges, trader details, asset information, and disclosure dates
  - StrategicInsights: AI-powered analysis card with black-gold theme, brain icon, "Generate Insight" button, loading states with animated sparkle, displays generated insights with title, multi-paragraph analysis, key signals list, hypothesized moves, risk level badge, and confidence percentage
  - Portfolio Manager: Table for holdings with editable percentage inputs, Dialog for trade confirmation
  - Leaderboard: Table with Avatar, ranking badges, sortable columns
  - Insights Feed: Scrollable Card list with timestamp, category badges
  - Profile: Avatar with upload/emoji picker, Input fields for username/bio, Switch components for notification preferences, EmailSettings card for email notification management
  - Market Data: Custom chart components with D3 for price history
  - Toasts (Sonner): Trade confirmations, insight deliveries, competition updates, email notification scheduling confirmations, AI insight generation success/failures
  - EmailSettings: Card component with email input, frequency selector, content checkboxes (leaderboard/market/insights)
  - EmailNotificationsManager: Background component that monitors preferences and schedules email generation
  
- **Customizations**: 
  - Custom animated Logo component reflecting brand's geometric typography and ascending arrow motif
  - Chart pattern decorative elements that echo the logo's upward trajectory
  - Custom ranking badge component with gradient borders and glow effects
  - Animated percentage change indicators with color-coded arrows
  - Custom market ticker component with scrolling prices
  - Profile avatar component supporting both uploaded images and emoji selection
  - Custom insight card with AI-generated content and sassy tone indicators (emoji reactions)
  - Branded stat cards with subtle chart pattern backgrounds
  - Black-gold themed insider trades section with distinctive glow effects, category filtering, and premium visual treatment
  
- **States**: 
  - Buttons: Default with subtle glow, hover with brightness increase and scale 1.02, active with press down, disabled with 40% opacity
  - Inputs: Default with neon border-bottom, focus with full neon border and subtle glow, error with red border pulse
  - Cards: Default elevated shadow, hover with increased elevation and border glow
  - Trade buttons: Pulse animation when market is volatile, success state with green flash
  - Logo: Animated on first load (onboarding), static in header for performance
  
- **Icon Selection**: 
  - TrendUp/TrendDown: Portfolio performance indicators, insider trade buy/sell actions
  - ChartLine: Market data and insights
  - Trophy: Leaderboard and winners
  - User/UserCircle: Profile and user management
  - Lightning: AI insights and quick actions (legacy, being phased out for chart arrow motif)
  - ArrowsClockwise: Refresh market data
  - Coins: Crypto assets
  - ChartBar: S&P 500 stocks
  - Bell: Notifications
  - Gear: Settings
  - Envelope: Email notifications and settings
  - Sparkle: Insider trading section header and empty states
  - Gavel: Congress trades category
  - Buildings: White House trades category
  
- **Spacing**: 
  - Container padding: p-6 (24px) on desktop, p-4 (16px) on mobile
  - Card gaps: gap-6 for dashboard grid
  - Element spacing: space-y-4 for stacked elements, gap-2 for inline groups
  - Section margins: mb-8 between major sections
  - Table cells: px-4 py-3
  
- **Mobile**: 
  - Tabs collapse to bottom navigation bar with icons only
  - Logo scales to sm size on mobile headers
  - Dashboard cards stack vertically instead of grid
  - Leaderboard table shows abbreviated columns (rank, avatar, name, % return only)
  - Portfolio manager switches from table to card-based list
  - Charts reduce height and show simplified view
  - Insights cards maintain full width with comfortable padding
  - Profile editor stacks fields vertically
  - Font sizes reduce slightly (H1 to 28px, body to 14px) for better mobile readability
