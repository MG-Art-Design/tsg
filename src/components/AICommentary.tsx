import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { UserProfile, Portfolio } from '@/lib/types'

interface AICommentaryProps {
  userProfile: UserProfile
  portfolio: Portfolio | null
  quarterRank: number
  lifetimeRank: number
  friendCount: number
  groupCount: number
  recentAction?: string
}

const SMILEY_ICON = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" stroke="oklch(0.70 0.14 75)" strokeWidth="2" fill="none"/>
    <circle cx="11" cy="12" r="1.5" fill="oklch(0.70 0.14 75)"/>
    <circle cx="21" cy="12" r="1.5" fill="oklch(0.70 0.14 75)"/>
    <path d="M10 19C10 19 12 22 16 22C20 22 22 19 22 19" stroke="oklch(0.70 0.14 75)" strokeWidth="2" strokeLinecap="round"/>
    <g filter="url(#glow)">
      <circle cx="16" cy="16" r="16" fill="oklch(0.70 0.14 75)" fillOpacity="0.1"/>
    </g>
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  </svg>
)

export function AICommentary({ 
  userProfile, 
  portfolio, 
  quarterRank, 
  lifetimeRank, 
  friendCount, 
  groupCount,
  recentAction 
}: AICommentaryProps) {
  const [isEnabled, setIsEnabled] = useKV<boolean>('ai-commentary-enabled', true)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [commentary, setCommentary] = useState('')

  const generateCommentary = () => {
    const comments: string[] = []

    if (recentAction) {
      if (recentAction.includes('portfolio_created')) {
        comments.push(`Oh look, fresh meat! Welcome to the jungle, ${userProfile.username}. Let's see if you can keep up.`)
      } else if (recentAction.includes('portfolio_updated')) {
        comments.push(`Bold moves, ${userProfile.username}. Either genius or reckless... we'll find out soon enough.`)
      } else if (recentAction.includes('friend_added')) {
        comments.push(`New friend alert! Hope they're ready to watch you either soar or crash spectacularly.`)
      }
    }

    if (portfolio) {
      const returnPercent = portfolio.totalReturnPercent
      if (returnPercent > 20) {
        comments.push(`${formatPercent(returnPercent)}? Okay, show-off. Don't let it go to your head.`)
      } else if (returnPercent > 10) {
        comments.push(`${formatPercent(returnPercent)} gains! Not bad for a human. I've seen better, but you're trying.`)
      } else if (returnPercent > 0) {
        comments.push(`Green is green, ${userProfile.username}. Rome wasn't built in a day... but they had better returns.`)
      } else if (returnPercent < -10) {
        comments.push(`Ouch. ${formatPercent(returnPercent)}? That's gonna leave a mark. Maybe diversify next time?`)
      } else if (returnPercent < 0) {
        comments.push(`Down ${formatPercent(Math.abs(returnPercent))}? Hey, at least you're consistent... consistently losing.`)
      }
    }

    if (quarterRank === 1 && friendCount > 0) {
      comments.push(`#1 baby! Your friends are probably crying into their keyboards right now.`)
    } else if (quarterRank === friendCount && friendCount > 1) {
      comments.push(`Dead last? Oof. At least you're winning at something... being in last place.`)
    } else if (quarterRank > 1 && quarterRank <= 3 && friendCount > 2) {
      comments.push(`#${quarterRank}? So close yet so far. First place is RIGHT there. Can you taste it?`)
    }

    if (friendCount === 0) {
      comments.push(`Zero friends? Either you're antisocial or everyone's scared of your trading skills. I'm betting on the former.`)
    } else if (friendCount === 1) {
      comments.push(`One whole friend! Congrats on not being completely alone in your financial decisions.`)
    }

    if (groupCount === 0) {
      comments.push(`No groups? Lone wolf style. Bold strategy. Or is it just that no one invited you?`)
    } else if (groupCount > 3) {
      comments.push(`${groupCount} groups? Someone's popular. Or desperate for validation. You decide.`)
    }

    if (portfolio?.positions.length === 1) {
      comments.push(`One position? All-in strategy? That's either brave or foolish. Probably foolish.`)
    } else if (portfolio && portfolio.positions.length > 10) {
      comments.push(`${portfolio.positions.length} positions?! Ever heard of "less is more"? This isn't Pokemon, you don't gotta catch 'em all.`)
    }

    if (comments.length === 0) {
      comments.push(`Hey ${userProfile.username}, still here? Just checking if you're paying attention.`)
      comments.push(`Another day, another dollar... or loss. Time will tell.`)
      comments.push(`Markets are wild today. You know what's wilder? Your portfolio choices.`)
    }

    return comments[Math.floor(Math.random() * comments.length)]
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  useEffect(() => {
    if (!isEnabled || hasShownThisSession) return

    const timer = setTimeout(() => {
      setCommentary(generateCommentary())
      setShowBubble(true)
      setHasShownThisSession(true)

      const hideTimer = setTimeout(() => {
        setShowBubble(false)
      }, 8000)

      return () => clearTimeout(hideTimer)
    }, 2000)

    return () => clearTimeout(timer)
  }, [isEnabled, userProfile.id])

  useEffect(() => {
    if (recentAction && isEnabled && hasShownThisSession) {
      setCommentary(generateCommentary())
      setShowBubble(true)

      const hideTimer = setTimeout(() => {
        setShowBubble(false)
      }, 8000)

      return () => clearTimeout(hideTimer)
    }
  }, [recentAction])

  return (
    <>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 z-50 max-w-sm"
          >
            <div className="relative">
              <div className="absolute -top-3 -left-3 z-10">
                <SMILEY_ICON />
              </div>
              
              <div className="bg-black/80 backdrop-blur-sm border-2 border-[oklch(0.70_0.14_75)] rounded-2xl p-4 pr-10 shadow-2xl">
                <p className="text-[oklch(0.70_0.14_75)] font-bold text-sm leading-relaxed">
                  {commentary}
                </p>
                
                <button
                  onClick={() => setShowBubble(false)}
                  className="absolute top-2 right-2 text-white/60 hover:text-[oklch(0.70_0.14_75)] transition-colors"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <svg className="absolute -bottom-3 right-8" width="24" height="12" viewBox="0 0 24 12">
                <path d="M12 12L24 0H0L12 12Z" fill="oklch(0.70 0.14 75)" opacity="0.9"/>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-[oklch(0.70_0.14_75)]/50 rounded-full px-4 py-2 shadow-lg">
        <SMILEY_ICON />
        <span className="text-xs text-white/80 font-semibold">AI Commentary</span>
        <button
          onClick={() => setIsEnabled(current => !current)}
          className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-[oklch(0.70_0.14_75)]' : 'bg-white/20'}`}
        >
          <motion.div
            animate={{ x: isEnabled ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
      </div>
    </>
  )
}
