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

### Email Notification System
- **Functionality**: Automated email delivery of performance summaries, leaderboard updates, market insights, and portfolio changes based on user-selected frequency (daily/weekly/monthly)
- **Purpose**: Keeps users engaged without requiring constant app checks; delivers personalized performance updates directly to inbox
- **Trigger**: User enables email notifications in profile settings with specified frequency and content preferences
- **Progression**: Enable in settings → Set email & frequency → Select content types (leaderboard/market/insights) → Receive scheduled updates → Email contains formatted HTML with portfolio performance, rankings, and AI insights
- **Success criteria**: Emails sent at correct intervals, content respects user preferences, HTML formatting displays correctly, emails include current rankings and accurate portfolio data

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

## Design Direction

The design should evoke sophistication and focus—a refined, monochromatic aesthetic that feels like a private trading terminal for serious competitors. Deep charcoal backgrounds with subtle blue-gray accents create a calm, focused environment where data takes center stage. The interface should feel like an exclusive club where strategy matters more than flash, and bold moves are celebrated with elegant restraint.

**Brand Identity:** The logo features hollow, outlined "STONK GAME" typography in the Playfair Display serif font with an ascending chart arrow cutting diagonally across—symbolizing upward momentum and market gains. This outlined, monochromatic treatment creates a refined, sophisticated appearance that integrates seamlessly with the dark background. The ascending line motif is extrapolated throughout: subtle chart patterns in card backgrounds, animated rising indicators, and gradient flows that echo stock trajectories.

## Color Selection

A sophisticated monochromatic palette built around blue-grays with minimal saturation—evoking calm focus, analytical precision, and professional trading terminals.

- **Primary Color**: Cool Steel Blue (oklch(0.72 0.06 210)) - Subtle, refined, represents clarity and upward momentum. Used for primary actions and positive performance indicators with restraint.
- **Secondary Colors**: 
  - Deep Charcoal Background (oklch(0.15 0.01 240)) - Rich, almost-black base that provides excellent contrast
  - Slate Surface (oklch(0.19 0.015 240)) - Slightly lighter panels for cards and surfaces
  - Muted Blue-Gray (oklch(0.38 0.04 240)) - Supporting color for secondary actions and neutral states
- **Accent Color**: Light Steel (oklch(0.68 0.08 220)) - Subtle blue-gray highlight for CTAs and important elements. Refined and understated.
- **Supporting Colors**:
  - Muted Green (oklch(0.70 0.12 145)) - Gains, positive returns, upward trends (desaturated)
  - Muted Red (oklch(0.58 0.18 25)) - Losses, negative returns, warnings (desaturated)
- **Foreground/Background Pairings**: 
  - Primary Steel Blue (oklch(0.72 0.06 210)): Deep Charcoal background (oklch(0.15 0.01 240)) - Ratio 6.2:1 ✓
  - Light Steel (oklch(0.68 0.08 220)): Deep Charcoal background (oklch(0.15 0.01 240)) - Ratio 5.5:1 ✓
  - Light text (oklch(0.92 0.01 240)): Deep Charcoal (oklch(0.15 0.01 240)) - Ratio 11.2:1 ✓
  - Light text (oklch(0.92 0.01 240)): Slate Surface (oklch(0.19 0.015 240)) - Ratio 8.8:1 ✓
  - Muted Green (oklch(0.70 0.12 145)): Deep Charcoal - Ratio 5.8:1 ✓

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
  - Dashboard: Card components for portfolio summary, market movers, recent insights
  - Portfolio Manager: Table for holdings with editable percentage inputs, Dialog for trade confirmation
  - Leaderboard: Table with Avatar, ranking badges, sortable columns
  - Insights Feed: Scrollable Card list with timestamp, category badges
  - Profile: Avatar with upload/emoji picker, Input fields for username/bio, Switch components for notification preferences, EmailSettings card for email notification management
  - Market Data: Custom chart components with D3 for price history
  - Toasts (Sonner): Trade confirmations, insight deliveries, competition updates, email notification scheduling confirmations
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
  
- **States**: 
  - Buttons: Default with subtle glow, hover with brightness increase and scale 1.02, active with press down, disabled with 40% opacity
  - Inputs: Default with neon border-bottom, focus with full neon border and subtle glow, error with red border pulse
  - Cards: Default elevated shadow, hover with increased elevation and border glow
  - Trade buttons: Pulse animation when market is volatile, success state with green flash
  - Logo: Animated on first load (onboarding), static in header for performance
  
- **Icon Selection**: 
  - TrendUp/TrendDown: Portfolio performance indicators
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
