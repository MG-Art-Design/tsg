import { motion, useAnimationControls } from 'framer-motion'
import { useState, useEffect } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: { height: 50, strokeWidth: 1.5 },
  md: { height: 70, strokeWidth: 2 },
  lg: { height: 90, strokeWidth: 2.5 },
  xl: { height: 120, strokeWidth: 3 }
}

export function Logo({ size = 'md', animated = true, className = '' }: LogoProps) {
  const dimensions = sizeMap[size]
  const [showReverb, setShowReverb] = useState(false)
  const [showEcho, setShowEcho] = useState(false)
  const shimmerControls = useAnimationControls()
  
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.8 },
        opacity: { duration: 0.4 }
      }
    }
  }

  const arrowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 1.3,
        duration: 0.6
      }
    }
  }

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setShowReverb(true)
        setShowEcho(true)
        shimmerControls.start({
          opacity: [0.3, 1, 0.5, 1, 0.3],
          scale: [1, 1.02, 1],
          filter: [
            'brightness(1) drop-shadow(0 0 8px oklch(0.75 0.14 75 / 0.4))',
            'brightness(1.4) drop-shadow(0 0 20px oklch(0.70 0.14 75 / 0.8))',
            'brightness(1.2) drop-shadow(0 0 12px oklch(0.75 0.14 75 / 0.5))',
            'brightness(1.3) drop-shadow(0 0 16px oklch(0.70 0.14 75 / 0.6))',
            'brightness(1) drop-shadow(0 0 8px oklch(0.75 0.14 75 / 0.4))'
          ],
          transition: {
            duration: 2.5,
            ease: "easeInOut"
          }
        })
      }, 1900)
      
      return () => clearTimeout(timer)
    }
  }, [animated, shimmerControls])

  return (
    <div className={`relative inline-flex ${className}`} style={{ height: dimensions.height }}>
      {showReverb && animated && (
        <>
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '-50%',
              right: '-30%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.70 0.14 75 / 0.25) 0%, oklch(0.65 0.12 75 / 0.15) 20%, oklch(0.60 0.10 75 / 0.08) 40%, transparent 70%)',
              filter: 'blur(50px)'
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ 
              opacity: [0, 0.8, 0.5, 0],
              scale: [0.3, 1.2, 1.8, 2.2],
            }}
            transition={{ 
              duration: 3,
              ease: [0.22, 0.61, 0.36, 1]
            }}
          />
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '-40%',
              right: '-25%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.75 0.14 75 / 0.3) 0%, oklch(0.70 0.14 75 / 0.2) 30%, transparent 60%)',
              filter: 'blur(40px)'
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ 
              opacity: [0, 0.9, 0.6, 0.3, 0],
              scale: [0.4, 1, 1.5, 2, 2.5],
            }}
            transition={{ 
              duration: 3.5,
              delay: 0.1,
              ease: [0.22, 0.61, 0.36, 1]
            }}
          />
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '-35%',
              right: '-20%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.70 0.14 75 / 0.35) 0%, oklch(0.68 0.13 75 / 0.18) 25%, transparent 55%)',
              filter: 'blur(35px)'
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 0.7, 0.4, 0],
              scale: [0.5, 0.8, 1.3, 1.8, 2.3],
            }}
            transition={{ 
              duration: 4,
              delay: 0.2,
              ease: [0.22, 0.61, 0.36, 1]
            }}
          />
        </>
      )}

      {showEcho && animated && (
        <>
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{
              top: '0',
              right: '0',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.72 0.14 75 / 0.4) 0%, oklch(0.68 0.12 75 / 0.2) 30%, transparent 60%)',
              filter: 'blur(30px)',
              mixBlendMode: 'screen'
            }}
            initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0.5, 0.3, 0],
              scale: [0.2, 1, 1.5, 2, 2.5],
              x: [0, -150, -400, -700, -1200],
              y: [0, 100, 250, 450, 750]
            }}
            transition={{ 
              duration: 2.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          />
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{
              top: '5%',
              right: '5%',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.70 0.14 75 / 0.5) 0%, oklch(0.65 0.12 75 / 0.25) 40%, transparent 70%)',
              filter: 'blur(25px)',
              mixBlendMode: 'screen'
            }}
            initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0.6, 0.4, 0],
              scale: [0.3, 1.2, 1.8, 2.3, 3],
              x: [0, -180, -450, -800, -1400],
              y: [0, 120, 300, 520, 850]
            }}
            transition={{ 
              duration: 2.8,
              delay: 0.15,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          />
          <motion.div
            className="fixed pointer-events-none z-50"
            style={{
              top: '2%',
              right: '2%',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, oklch(0.75 0.14 75 / 0.6) 0%, oklch(0.70 0.13 75 / 0.3) 35%, transparent 65%)',
              filter: 'blur(20px)',
              mixBlendMode: 'screen'
            }}
            initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0.7, 0.5, 0.2, 0],
              scale: [0.4, 1.4, 2, 2.6, 3.2, 4],
              x: [0, -200, -500, -900, -1300, -1600],
              y: [0, 140, 330, 580, 850, 1100]
            }}
            transition={{ 
              duration: 3,
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          />
        </>
      )}

      <motion.svg
        viewBox="0 0 280 80"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto relative z-10"
        style={{ filter: 'drop-shadow(0 0 8px oklch(0.75 0.08 195 / 0.15))' }}
        animate={animated ? shimmerControls : undefined}
      >
        <defs>
          <linearGradient id="goldShimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.60 0.12 75)" />
            <stop offset="25%" stopColor="oklch(0.70 0.14 75)" />
            <stop offset="50%" stopColor="oklch(0.75 0.14 75)" />
            <stop offset="75%" stopColor="oklch(0.70 0.14 75)" />
            <stop offset="100%" stopColor="oklch(0.60 0.12 75)" />
          </linearGradient>

          {animated && (
            <linearGradient id="goldAnimatedShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.60 0.12 75)">
                <animate
                  attributeName="stop-color"
                  values="oklch(0.60 0.12 75); oklch(0.75 0.14 75); oklch(0.60 0.12 75)"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="25%" stopColor="oklch(0.65 0.13 75)">
                <animate
                  attributeName="stop-color"
                  values="oklch(0.65 0.13 75); oklch(0.80 0.15 75); oklch(0.65 0.13 75)"
                  dur="3s"
                  begin="0.2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="oklch(0.70 0.14 75)">
                <animate
                  attributeName="stop-color"
                  values="oklch(0.70 0.14 75); oklch(0.85 0.16 75); oklch(0.70 0.14 75)"
                  dur="3s"
                  begin="0.4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="75%" stopColor="oklch(0.65 0.13 75)">
                <animate
                  attributeName="stop-color"
                  values="oklch(0.65 0.13 75); oklch(0.80 0.15 75); oklch(0.65 0.13 75)"
                  dur="3s"
                  begin="0.6s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="oklch(0.60 0.12 75)">
                <animate
                  attributeName="stop-color"
                  values="oklch(0.60 0.12 75); oklch(0.75 0.14 75); oklch(0.60 0.12 75)"
                  dur="3s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          )}
        </defs>

        <text
          x="15"
          y="22"
          fontFamily="'Playfair Display', serif"
          fontSize="14"
          fontWeight="500"
          fill="none"
          stroke={animated ? "url(#goldAnimatedShimmer)" : "url(#goldShimmerGradient)"}
          strokeWidth={dimensions.strokeWidth * 0.7}
          letterSpacing="2"
          opacity="0.9"
        >
          THE
        </text>

        <text
          x="15"
          y="48"
          fontFamily="'Playfair Display', serif"
          fontSize="28"
          fontWeight="700"
          fill="none"
          stroke={animated ? "url(#goldAnimatedShimmer)" : "url(#goldShimmerGradient)"}
          strokeWidth={dimensions.strokeWidth}
          letterSpacing="1"
        >
          STONK
        </text>

        <text
          x="15"
          y="72"
          fontFamily="'Playfair Display', serif"
          fontSize="28"
          fontWeight="700"
          fill="none"
          stroke={animated ? "url(#goldAnimatedShimmer)" : "url(#goldShimmerGradient)"}
          strokeWidth={dimensions.strokeWidth}
          letterSpacing="1"
        >
          GAME
        </text>

        {animated ? (
          <motion.path
            d="M 35 62 Q 80 50, 110 45 T 180 32 Q 220 26, 260 18"
            stroke="url(#goldAnimatedShimmer)"
            strokeWidth={dimensions.strokeWidth * 1.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
        ) : (
          <path
            d="M 35 62 Q 80 50, 110 45 T 180 32 Q 220 26, 260 18"
            stroke="url(#goldShimmerGradient)"
            strokeWidth={dimensions.strokeWidth * 1.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {animated ? (
          <motion.g
            variants={arrowVariants}
            initial="hidden"
            animate="visible"
          >
            <path
              d="M 260 18 L 252 14 L 254 22 Z"
              fill="url(#goldAnimatedShimmer)"
              opacity="0.85"
            />
          </motion.g>
        ) : (
          <path
            d="M 260 18 L 252 14 L 254 22 Z"
            fill="url(#goldShimmerGradient)"
            opacity="0.85"
          />
        )}
      </motion.svg>
    </div>
  )
}
