# TSG: The Stonk Game - Planning Guide

A virtual trading competition platform where friends compete in quarterly S&P 500 and crypto prediction challenges, tracking performance, sharing achievements, and enjoying friendly rivalry through paper trading.

**Experience Qualities**:
1. **Playfully Competitive** - The app encourages friendly rivalry with sassy commentary and leaderboards that motivate users to take bold moves
2. **Intelligently Informed** - Real market data powers insights and trend analysis delivered at user-preferred frequencies to keep players educated
3. **Intimately Social** - Personalized profiles, performance updates, and competitive standings create a tight-knit community experience

**Complexity Level**: **Complex Application** (advanced functionality, likely with multiple views)
This app requires multiple interconnected features including user profiles, real-time market data visualization, performance tracking systems, leaderboard calculations, quarterly competition cycles, personalized AI-generated insights, and a sophisticated state management system across different views.

## Essential Features

### Email-Based Authentication & Persistent Sessions
- **Functionality**: Users create accounts with email and password, remain logged in across sessions, and can sign out when needed
- **Purpose**: Provides secure user identity and enables persistent data tied to email addresses, allowing users to access their portfolios from any device
- **Trigger**: First-time app load shows authentication screen; returning users automatically load their profile
- **Progression**: Enter email → Set password (6+ characters) → Create account → Complete profile setup → Dashboard OR Return to site → Auto-login with saved session → Dashboard
- **Success criteria**: Users remain logged in across page refreshes, email addresses are unique, passwords securely stored, sign out clears session and returns to login

### Biometric Authentication (Fast Sign-In)
- **Functionality**: Users can enable fingerprint or Face ID authentication for instant sign-in without password entry, using device's secure enclave via WebAuthn API
- **Purpose**: Provides ultra-fast, secure authentication for returning users while maintaining security standards, reducing friction on frequent visits
- **Trigger**: Login screen displays biometric option if device supports it and user previously enabled it; Profile settings allow enabling/disabling
- **Progression**: First time: Sign in with password → Navigate to Profile → Enable biometric → Authenticate biometric enrollment → Enabled. Next visit: Open app → Tap biometric button → Face ID/fingerprint scan → Instant sign-in to dashboard
- **Success criteria**: Biometric prompt appears automatically on supported devices, authentication completes in under 2 seconds, biometric data stays on device only, graceful fallback to password if biometric fails, toggle in Profile settings works correctly

### User Profile Creation & Management
- **Functionality**: Create custom profiles with email, avatar upload (or emoji selection), username, bio, cover photo customization, and notification preferences
- **Purpose**: Establishes personal identity within the competitive space and allows preference customization tied to a unique email, with visual personalization through cover photos
- **Trigger**: After account creation or clicking profile settings
- **Progression**: Authentication → Profile creation form → Avatar selection → Cover photo selection → Bio entry → Notification preferences → Dashboard
- **Success criteria**: Profile persists across sessions tied to email, displays correctly on leaderboards with cover photos, preferences control notification frequency, cover photos display on profile header

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
- **Functionality**: Real-time rankings showing only friends' returns with relationship-based filtering (All/Friend/Rival/Mentor/Mentee/Colleague/Family/Other), creating an intimate competition space with your chosen rivals
- **Purpose**: Fuels personal competition with friends, celebrates winners in your circle, motivates strategic improvement, and allows focused competition views based on relationship types
- **Trigger**: Leaderboard tab navigation
- **Progression**: Open leaderboard → View friend rankings → Filter by relationship type → See detailed returns → Add more friends to expand competition
- **Success criteria**: Rankings show only added friends, updates in real-time, percentage returns calculated correctly, filters work correctly to show specific relationship types, empty state prompts friend adding

### Friend Management System
- **Functionality**: Add friends via unique friend code, creating bilateral connections that sync both users to each other's leaderboards
- **Purpose**: Enables users to build their personal competition circle with chosen rivals, keeping competitions intimate and meaningful
- **Trigger**: "Add Friend" button in Profile tab or empty leaderboard state
- **Progression**: Click add friend → Enter friend's unique code → Confirmation → Friend appears on both leaderboards → Compete together
- **Success criteria**: Friend codes are unique per user, adding friend syncs both users, friends appear on each other's leaderboards, can remove friends bilaterally

### Relationship Status Management
- **Functionality**: Categorize friends by relationship type (Friend, Rival, Mentor, Mentee, Colleague, Family, Other) with visual badges and bilateral synchronization
- **Purpose**: Allows users to organize their leaderboard connections meaningfully, creating context for different competitive dynamics and viewing patterns
- **Trigger**: Profile settings → Relationship Status section
- **Progression**: View friends list → Select relationship type for each friend → Changes sync to both users → Relationship badges appear on leaderboard
- **Success criteria**: Relationship statuses persist, display as badges on leaderboard entries, reciprocal statuses update automatically (mentor/mentee), can be changed anytime, filters work correctly

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
- **Functionality**: Displays publicly disclosed insider trades from Congress members, White House officials, Trump family/partners, and affiliates, updated every 12 hours with filtering by category, featuring 2x the research depth with mock data representing 35+ trades
- **Purpose**: Provides competitive intelligence on high-profile trades to inform user investment strategies and add intrigue to the competition
- **Trigger**: Automatically displayed on Dashboard; data refreshes every 12 hours
- **Progression**: Load Dashboard → View "Stonk: Omg It's In" section → Filter by category (All/Congress/White House/Trump Family) → Review trade details (trader, asset, action, value, dates) → Free users see 2 trades per category, Premium users see all → Use intelligence for portfolio decisions
- **Success criteria**: Data updates every 12 hours, displays accurate trade information with 35+ mock trades, filters work correctly, distinctive black-gold styling sets section apart visually, maintains monochromatic design consistency, free users see limited preview with upgrade prompt

### Strategic Positioning AI - Enhanced ("Stonk: Omg It's In" Analysis)
- **Functionality**: Premium-only feature with two-part AI vetting system that analyzes insider trading patterns at 2x research depth, identifying key Congress members, Trump family activities, Stephen Miller affiliates, and extrapolating quiet hand analysis to generate strategic asset categorizations and trading signals
- **Purpose**: Transforms raw insider trading data into deeply vetted actionable intelligence with strategic asset recommendations across five categories (highest growth, highest volatility, lowest volatility, consistent performers, underrated genius choices)
- **Trigger**: Premium users click "Generate Vetted Insight" button in Strategic Positioning AI - Enhanced card on Dashboard; free users see locked premium feature with upgrade prompt
- **Progression**: Premium user clicks Generate → Phase 1 vetting begins (pattern recognition, player analysis, anomaly detection) → Phase 1 completes with score → Phase 2 vetting begins (quiet hand extrapolation, strategic synthesis, asset categorization) → Phase 2 completes with score → Final synthesis creates comprehensive insight → Display across 4 tabs: Overview (analysis with vet scores), Assets (5 categories with 3-5 recommendations each), Signals (5-7 trading signals with strength/time horizon), Players (key insider profiles with influence scores)
- **Success criteria**: Two-part vetting completes successfully with Phase 1 and Phase 2 scores, combined vet score (0-100) displayed prominently, analysis identifies key players by category (congress/whitehouse/trump-family/stephen-miller/affiliate), asset recommendations span all 5 strategic categories with ticker symbols, trading signals include bullish/bearish/neutral designation with reasoning, quiet hand analysis reveals non-obvious positioning, tabbed interface allows exploration of different intelligence aspects, maintains black-gold design theme

### Relationship-Based Notifications
- **Functionality**: Real-time toast notifications for friend activity, portfolio changes, leaderboard movements, and relationship updates, all contextual to the relationship status set by the user
- **Purpose**: Keeps users engaged with their friend network through timely alerts about significant portfolio movements (±5%), rank changes, and new connections
- **Trigger**: Automatic background monitoring every 30 seconds; fires when conditions are met based on user preferences
- **Progression**: Background check → Detect significant change (portfolio shift, rank change, new friend) → Check notification preferences → Display toast with relationship context → Auto-dismiss after 5 seconds
- **Success criteria**: Notifications respect user preferences, only fire for significant changes, include relationship context (e.g., "Your rival is surging!"), don't spam users, can be toggled on/off per category

### Group-Based Mini Games
- **Functionality**: Group administrators can start "New Game" competitions where members select exactly 3 stocks or cryptos to compete on performance over a defined period (1 week, 2 weeks, or 1 month), with separate leaderboards and the ability to re-select picks for each new game. All game activity is tracked in the activity history system with AI-generated performance summaries.
- **Purpose**: Creates focused, time-bound competitions within groups with simpler rules (only 3 picks) to encourage quick engagement and friendly rivalry, while providing historical context through AI-powered summaries
- **Trigger**: Group owner clicks "New Game" button in Groups tab → Game section
- **Progression**: Owner creates game (name, duration, allowed asset types) → Game starts → Members submit 3 picks (tracked in activity log) → Real-time leaderboard updates as market moves → Game ends → Winner declared → AI generates sassy performance summary → New game can be started with fresh picks
- **Success criteria**: Only group owners can create games, members can only submit picks once per game, picks are locked after submission, leaderboard shows only game participants, performance tracked independently from main portfolios, games can run concurrent with quarterly competitions, past game results are preserved, activity events logged for picks and updates, AI summaries generated on completion

### Activity History & Selective Sharing
- **Functionality**: Comprehensive tracking system that logs all user activity (portfolio changes, game picks, rank movements, milestones) with selective sharing controls and AI-powered quarterly and game summaries in TSG's signature sassy style
- **Purpose**: Provides users with a rich historical record of their trading journey while allowing them to control what activity data is shared with friends and specific groups, fostering transparency and competition
- **Trigger**: Automatic activity logging on all portfolio/game actions; manual summary generation from Profile tab → Activity History section
- **Progression**: User performs actions (create portfolio, update picks) → Events automatically logged with metadata → User navigates to Activity History → Views quarterly/game timelines → Clicks "Generate Summary" → AI analyzes activity and performance → Sassy, personalized summary created → User configures sharing preferences (friends/specific groups) → Selected audiences can view shared activity
- **Success criteria**: All significant actions logged with timestamps and metadata, quarterly summaries track portfolio performance with 3-paragraph AI analysis, game summaries provide 2-paragraph roasts/celebrations, sharing toggles work per friend/group, activity timeline shows recent events with icons, summaries maintain TSG's witty personality, users can regenerate summaries for fresh perspectives

### Group Betting System with Payment Integration
- **Functionality**: Group admins can enable betting with customizable entry fees, payout structures (winner-take-all, top-3, top-5), and period types (weekly, monthly, season). Winners are automatically calculated at game end, and payout notifications with payment QR codes are sent to all group members. Users add Venmo/Zelle accounts to their profiles for seamless payment collection.
- **Purpose**: Adds real stakes to competitions, motivating engagement and creating exciting financial incentives while keeping payments simple through QR codes
- **Trigger**: Group admin enables betting in Groups → Betting tab; payouts trigger automatically when games end
- **Progression**: Admin sets entry fee & payout structure → Members see betting status in group → Game ends → System calculates winner and amounts owed → Members receive payout notification with winner's payment QR codes → Members pay via Venmo/Zelle → Members mark payment as complete → Admin can reset payouts anytime
- **Success criteria**: Betting settings save per group, payout calculations are accurate based on structure, notifications show winner's payment accounts with QR codes, payment status tracking works, admins can reset betting history, weekly/monthly/season payouts calculated correctly based on game duration, all members notified simultaneously when payouts are due

### Payment Account Management
- **Functionality**: Users can add multiple Venmo or Zelle payment accounts with QR code uploads and account identifiers (username/email/phone) from their profile settings
- **Purpose**: Enables seamless payment collection when winning group bets without manual exchange of payment information
- **Trigger**: Profile tab → Payment Accounts section → Add Account
- **Progression**: Click add account → Select Venmo or Zelle → Enter account identifier → Upload QR code image (optional) → Save → Account appears on profile → Automatically shown to group members when user wins a bet
- **Success criteria**: QR codes upload and display correctly, account identifiers save properly, winner's payment info appears in payout notifications, can have multiple accounts, can delete accounts, QR images under 2MB

### Signal Chat Export with AI Commentary & Automatic Scheduling
- **Functionality**: Group admins can configure automatic or manual exports of group activity to external Signal group chats, including leaderboard standings, AI-generated trash talk about player performance, chat summaries, and performance praise/roasts, with automatic scheduled updates (daily, weekly, and/or monthly)
- **Purpose**: Extends the competitive banter beyond the app into users' daily Signal conversations, keeps groups engaged even when not actively using TSG, lets AI roast poor performers while praising savvy moves, and ensures regular leaderboard updates are delivered on a consistent schedule
- **Trigger**: Groups tab → Select group → Signal tab (admin only); automatic triggers based on schedule configuration
- **Progression**: Admin configures phone number (optional) → Sets update frequency (instant/hourly/daily) → Enables leaderboard updates → Enables AI trash talk → Sets intensity (mild/moderate/savage) → Enables automatic leaderboard updates → Configures daily schedule (specific time), weekly schedule (day + time), and/or monthly schedule (date + time) → Scheduled updates automatically generate exports at configured times with toast notification → Admin can also manually click "Generate Export" anytime → AI analyzes current standings and generates sarcastic commentary about leaders and losers → Preview shows formatted export with leaderboard rankings, trash talk messages, and chat summary → Admin copies to clipboard or downloads → Pastes into Signal group chat
- **Success criteria**: Only group admins see Signal export tab, trash talk intensity affects AI tone (mild=friendly, moderate=competitive, savage=brutal), AI references actual returns and rank changes, messages under 160 characters, exports include formatted leaderboard with top 5 players, praise messages highlight significant gains/losses, chat summaries capture conversation vibe, copy to clipboard and download both work, instructions show Signal CLI commands if phone number provided, previous leaderboard tracked to detect rank changes for better trash talk, automatic scheduling triggers at correct times in user's local timezone, toast notifications appear when scheduled updates are ready, configuration UI shows active schedules clearly, can enable multiple schedule types simultaneously (daily + weekly + monthly), scheduled exports include indicator showing which schedule triggered them

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
- **Email Already Registered**: Sign up prevents duplicate emails; prompts user to log in instead
- **Incorrect Password**: Login shows error without revealing whether email exists for security
- **Lost Session**: Auto-login fails gracefully, returning user to login screen with no data loss
- **Relationship Status Conflicts**: If friend removes user, relationship statuses clear bilaterally
- **Orphaned Relationship Data**: Removing friend cleans up relationship status for both users
- **Insider Trade Data Unavailable**: If 12-hour scrape fails, display last known data with timestamp; show "Data updating..." message in header
- **Empty Insider Trade Categories**: When filtering shows no results, display friendly empty state with sparkle icon and explanatory message
- **AI Insight Generation Failures**: If LLM call fails, show error toast with retry option; previous insights remain visible
- **No Trades Available for Analysis**: Generate Insight button disabled with tooltip explaining data needed; empty state shown in Strategic Positioning AI card
- **Empty Activity History**: Shows friendly empty states for quarters and games with prompts to start trading
- **AI Summary Generation Failures**: Error toast with retry button; existing summaries remain accessible
- **No Activity Data for Summary**: Button disabled with explanation that activity data is needed
- **Sharing Permission Changes**: When user removes sharing permission, previously shared data becomes private immediately
- **Missing Game Data for Summary**: System gracefully handles incomplete game data by generating partial summaries
- **Concurrent Summary Generation**: Prevents multiple simultaneous summary requests with loading state
- **Betting Without Payment Accounts**: Winners without payment accounts still show in notifications with prompt to add accounts
- **Betting Payout Disputes**: No built-in dispute system; users handle payment issues directly via group chat
- **Mid-Game Betting Changes**: Betting settings cannot be changed once a game is active with bets placed
- **Zero Members After Betting Reset**: Group continues normally; new games can be created with fresh betting settings
- **Payment QR Code Display Failures**: If QR doesn't load, fallback to account identifier text
- **Multiple Simultaneous Payout Notifications**: Users can have multiple pending payments across different groups
- **Missed Scheduled Signal Exports**: If user is offline when scheduled export triggers, notification appears on next app load; exports don't accumulate (only latest is kept)
- **Timezone Changes**: Scheduled times respect user's current local timezone; changing timezone automatically adjusts schedule
- **Multiple Active Schedules**: When daily, weekly, and monthly schedules overlap (e.g., Monday at 9am which is also the 1st), only one export is generated with highest priority schedule type noted
- **Schedule During Inactive Group**: Scheduled exports pause if group has no recent activity; resume when activity detected
- **Browser Tab Closed During Schedule**: Schedules only trigger when app is open; closing tab suspends scheduling until next app load

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

### Haptic Hover Effects (Desktop)
All clickable elements feature sophisticated hover interactions that create a forward-pulling, haptic-feeling experience designed to encourage engagement and build user confidence:

- **Universal Button Behavior**: Scale up (1.02x), font-weight increase to 600, subtle glow effect with blue-gold shadow, brightness increase, and spring back on press (0.98x scale)
- **Navigation Tabs**: Vertical lift (-2px), 1.03x scale, enhanced gold shadow effect mimicking the insider trading aesthetic
- **Icon Buttons**: 1.15x scale with 5° rotation, enhanced brightness with drop-shadow, rotate back (2°) on press
- **Text Links**: Font-weight increase to 600, subtle horizontal shift (2px), animated underline growing from left, slight letter-spacing increase, and blue glow
- **Dropdown/Select Items**: Font-weight increase to semibold, subtle horizontal shift (0.5px right)
- **Dialog/Sheet Close Buttons**: Icon rotation (90°) on hover combined with 1.1x scale for playful dismissal feedback
- **Card Links** (when applicable): Vertical lift (-4px), 1.01x scale, enhanced box-shadow with layered blue glow
- **Timing**: All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` easing at 0.2-0.3s for smooth, responsive feel
- **Accessibility**: Effects only apply on desktop with fine pointer input (`@media (hover: hover) and (pointer: fine)`); touch devices get simpler interactions

These hover effects create a consistent language of "pull-forward" interaction across the entire app, making every clickable element feel inviting and tactile, reducing hesitation and increasing engagement confidence.

## Component Selection

- **Components**: 
  - Auth: Email/password authentication card with sign up/sign in toggle, form validation, loading states
  - Logo: Custom SVG component with animated ascending chart line and gradient text (variants: sm, md, lg, xl)
  - BrandElements: ChartPattern (decorative background motifs), BrandBadge (category/status indicators), StatCard (metrics display with trend patterns), BrandDivider (gradient section separators)
  - Navigation: Tabs for main sections (Dashboard, Portfolio, Leaderboard, Groups, Insights, Profile) with sign out button
  - Dashboard: Card components for portfolio summary, market movers, recent insights, and "Stonk: Omg It's In" insider trades section
  - InsiderTrades: Distinctive black-gold themed card with category filters (All/Congress/White House/Trump Family), animated trade entries with buy/sell badges, trader details, asset information, and disclosure dates
  - StrategicInsights: AI-powered analysis card with black-gold theme, brain icon, "Generate Insight" button, loading states with animated sparkle, displays generated insights with title, multi-paragraph analysis, key signals list, hypothesized moves, risk level badge, and confidence percentage
  - Portfolio Manager: Table for holdings with editable percentage inputs, Dialog for trade confirmation
  - Leaderboard: Table with Avatar, ranking badges, relationship status badges (Friend/Rival/Mentor/etc), sortable columns
  - FriendsManager: Card for adding friends via code, displaying friend list with relationship indicators
  - RelationshipManager: Card for categorizing friends by relationship type with visual badges and bilateral sync
  - ActivityHistoryManager: Tabbed card showing quarterly performance and game history, with timeline of events (portfolio changes, game picks, rank movements, milestones), AI summary generation buttons, sharing preferences dialog with friend/group selection
  - Insights Feed: Scrollable Card list with timestamp, category badges
  - Profile: Avatar with upload/emoji picker, Input fields for username/bio, Switch components for notification preferences, EmailSettings card for email notification management, relationship status management, Activity History section
  - Market Data: Custom chart components with D3 for price history
  - Toasts (Sonner): Trade confirmations, insight deliveries, competition updates, email notification scheduling confirmations, AI insight generation success/failures, authentication feedback, friend/relationship updates, activity tracking confirmations, summary generation status
  - EmailSettings: Card component with email input, frequency selector, content checkboxes (leaderboard/market/insights)
  - EmailNotificationsManager: Background component that monitors preferences and schedules email generation
  - GroupGameManager: Game creation and management with activity tracking for all pick submissions and updates
  
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
  - TrendUp/TrendDown: Portfolio performance indicators, insider trade buy/sell actions, activity performance changes
  - ChartLine: Market data and insights
  - Trophy: Leaderboard and winners, game competitions
  - User/UserCircle: Profile and user management
  - Lightning: AI insights and quick actions, portfolio activities
  - ArrowsClockwise: Refresh market data
  - Coins: Crypto assets
  - ChartBar: S&P 500 stocks
  - Bell: Notifications
  - Gear: Settings
  - Envelope: Email notifications and settings
  - Sparkle: Insider trading section header and empty states, AI summary generation
  - Gavel: Congress trades category
  - Buildings: White House trades category
  - ClockClockwise: Activity history and timeline
  - ShareNetwork: Sharing preferences and controls
  - Crown: First place rankings in games
  - Medal: Second and third place rankings in games
  
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
