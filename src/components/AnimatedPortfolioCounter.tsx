import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendUp, TrendDown, FireSimple } from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface AnimatedPortfolioCounterProps {
  currentValue: number
  previousValue: number
  totalReturn: number
  totalReturnPercent: number
}

const SARCASM_COMMENTS = {
  massiveGain: [
    "Oh wow, look at you. Warren Buffett over here. Don't spend it all in one place.",
    "Incredible. You're basically a financial genius now. Should I get your autograph?",
    "Congrats on your lottery win. I'm sure it was all skill and definitely not luck.",
    "Amazing. You've discovered the secret: buy low, sell high. Revolutionary stuff.",
    "Well, well, well. Someone's feeling themselves. Try not to let it go to your head."
  ],
  bigGain: [
    "Nice gain. Almost impressive. Don't quit your day job though.",
    "Look at you making money. How delightfully ordinary.",
    "Wow, a profit. Someone give this person a trophy. Oh wait, we already did.",
    "Solid gains. You're basically a hedge fund manager now. Except, you know, not.",
    "Great job. Your portfolio went up. Groundbreaking stuff right there."
  ],
  smallGain: [
    "Oh, a tiny gain. How thrilling. I can barely contain my excitement.",
    "You made... let me check... yeah, almost nothing. Congratulations?",
    "Wow, pocket change. You could almost buy a coffee with that profit.",
    "Such gains. Much wow. Very profit. Okay, I'm done.",
    "Up by a bit. Don't go buying a yacht just yet, champ."
  ],
  neutral: [
    "Perfectly balanced, as all things should be. Or are you just bad at this?",
    "Breaking even. The rallying cry of mediocrity everywhere.",
    "Wow, zero change. You're as exciting as watching paint dry.",
    "Flat as a pancake. At least you're consistent in your averageness.",
    "No gains, no losses. Living life on the edge, I see."
  ],
  smallLoss: [
    "Down a bit. Don't worry, it's probably just a 'temporary setback.' Sure.",
    "Lost some money? Shocking. Who could have seen this coming?",
    "Oh no, you're down. Anyway, have you tried... not losing money?",
    "A little loss never hurt anyone. Except your wallet. And your pride.",
    "Down but not out. Well, maybe a little bit out."
  ],
  bigLoss: [
    "Ouch. That's gonna leave a mark. Want me to call someone for you?",
    "Well, this is awkward. Should we talk about it or just pretend it didn't happen?",
    "Big loss there, chief. But hey, you can't lose money if you don't have any left!",
    "Yikes. I'd offer condolences but I'm just a sarcastic AI. So... thoughts and prayers?",
    "Impressive losses. Takes real dedication to lose that much. Bravo."
  ],
  massiveLoss: [
    "Holy mother of losses. Batman, we have a problem. A big one.",
    "I... I don't even know what to say. This is performance art at this point.",
    "Congratulations! You've unlocked achievement: 'How Did You Manage That?'",
    "This is fine. Everything is fine. *nervous laughter* Nothing to see here.",
    "Well, you tried. And failed. Spectacularly. But you tried, and that's... something?"
  ]
}

function getSarcasmLevel(returnPercent: number): number {
  const absReturn = Math.abs(returnPercent)
  if (absReturn > 50) return 100
  if (absReturn > 20) return 85
  if (absReturn > 10) return 70
  if (absReturn > 5) return 55
  if (absReturn > 2) return 40
  if (absReturn > 0.5) return 25
  return 10
}

function getSarcasticComment(returnPercent: number, returnValue: number): string {
  let category: keyof typeof SARCASM_COMMENTS
  
  if (returnPercent >= 15) {
    category = 'massiveGain'
  } else if (returnPercent >= 5) {
    category = 'bigGain'
  } else if (returnPercent > 0.5) {
    category = 'smallGain'
  } else if (returnPercent >= -0.5) {
    category = 'neutral'
  } else if (returnPercent > -5) {
    category = 'smallLoss'
  } else if (returnPercent > -15) {
    category = 'bigLoss'
  } else {
    category = 'massiveLoss'
  }
  
  const comments = SARCASM_COMMENTS[category]
  return comments[Math.floor(Math.random() * comments.length)]
}

export function AnimatedPortfolioCounter({ 
  currentValue, 
  previousValue,
  totalReturn,
  totalReturnPercent 
}: AnimatedPortfolioCounterProps) {
  const [displayValue, setDisplayValue] = useState(previousValue)
  const [comment, setComment] = useState<string>("")
  const [showComment, setShowComment] = useState(false)
  const prevValueRef = useRef(previousValue)
  const commentTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (Math.abs(currentValue - prevValueRef.current) > 0.01) {
      const startValue = prevValueRef.current
      const endValue = currentValue
      const duration = 1000
      const startTime = Date.now()

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const nextValue = startValue + (endValue - startValue) * eased

        setDisplayValue(nextValue)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          prevValueRef.current = currentValue
        }
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(animate)

      if (commentTimerRef.current) {
        clearTimeout(commentTimerRef.current)
      }

      setShowComment(false)
      
      commentTimerRef.current = setTimeout(() => {
        const newComment = getSarcasticComment(totalReturnPercent, totalReturn)
        setComment(newComment)
        setShowComment(true)
      }, 800)
    }
  }, [currentValue, totalReturnPercent, totalReturn])

  useEffect(() => {
    return () => {
      if (commentTimerRef.current) {
        clearTimeout(commentTimerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const sarcasmLevel = getSarcasmLevel(totalReturnPercent)
  const isPositive = totalReturn >= 0

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-muted/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[oklch(0.70_0.14_75_/_0.1)] to-transparent animate-shimmer" 
             style={{
               backgroundSize: '200% 100%',
               animation: 'shimmer 3s infinite'
             }} 
        />
        <CardContent className="pt-6 relative z-10">
          <div className="text-center space-y-4">
            <div className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Portfolio Value
            </div>
            <motion.div 
              className="text-5xl sm:text-6xl font-bold tracking-tight font-['Playfair_Display']"
              animate={currentValue !== previousValue ? {
                scale: [1, 1.05, 1],
                textShadow: [
                  '0 0 0px transparent',
                  isPositive 
                    ? '0 0 20px oklch(0.70 0.12 145 / 0.6)' 
                    : '0 0 20px oklch(0.58 0.18 25 / 0.6)',
                  '0 0 0px transparent'
                ]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {formatCurrency(displayValue)}
            </motion.div>
            {totalReturn !== 0 && (
              <motion.div 
                className={`flex items-center justify-center gap-2 text-lg font-semibold ${
                  isPositive ? 'text-success' : 'text-destructive'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {isPositive ? (
                  <TrendUp size={20} weight="bold" />
                ) : (
                  <TrendDown size={20} weight="bold" />
                )}
                <span>
                  {formatPercent(totalReturnPercent)} ({formatCurrency(Math.abs(totalReturn))})
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {showComment && comment && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-[1fr_auto] gap-4"
        >
          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-[oklch(0.08_0.006_70)] to-card">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl mt-1">🤖</div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[oklch(0.70_0.14_75)] mb-1 uppercase tracking-wide">
                    AI Commentary
                  </div>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed italic">
                    "{comment}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-[oklch(0.08_0.006_70)] to-card min-w-[140px]">
            <CardContent className="pt-4 pb-4 h-full flex flex-col justify-center">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-1">
                  <FireSimple 
                    size={20} 
                    weight="fill" 
                    className="text-[oklch(0.70_0.14_75)]"
                  />
                  <div className="text-xs font-semibold text-[oklch(0.70_0.14_75)] uppercase tracking-wide">
                    Sarcasm
                  </div>
                </div>
                <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, 
                        oklch(0.70 0.12 145) 0%, 
                        oklch(0.75 0.14 75) 50%, 
                        oklch(0.58 0.18 25) 100%)`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${sarcasmLevel}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <motion.div 
                  className="text-2xl font-bold text-[oklch(0.70_0.14_75)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                >
                  {sarcasmLevel}%
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
