import { motion } from 'framer-motion'

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

  return (
    <div className={`relative inline-flex ${className}`} style={{ height: dimensions.height }}>
      <svg
        viewBox="0 0 280 80"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        style={{ filter: 'drop-shadow(0 0 8px oklch(0.75 0.08 195 / 0.15))' }}
      >
        <defs>
          <linearGradient id="monoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.12 75)" />
            <stop offset="50%" stopColor="oklch(0.70 0.14 75)" />
            <stop offset="100%" stopColor="oklch(0.65 0.12 75)" />
          </linearGradient>
        </defs>

        <text
          x="15"
          y="22"
          fontFamily="'Playfair Display', serif"
          fontSize="14"
          fontWeight="500"
          fill="none"
          stroke="url(#monoGradient)"
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
          stroke="url(#monoGradient)"
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
          stroke="url(#monoGradient)"
          strokeWidth={dimensions.strokeWidth}
          letterSpacing="1"
        >
          GAME
        </text>

        {animated ? (
          <motion.path
            d="M 35 62 Q 80 50, 110 45 T 180 32 Q 220 26, 260 18"
            stroke="url(#monoGradient)"
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
            stroke="url(#monoGradient)"
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
              fill="url(#monoGradient)"
              opacity="0.85"
            />
          </motion.g>
        ) : (
          <path
            d="M 260 18 L 252 14 L 254 22 Z"
            fill="url(#monoGradient)"
            opacity="0.85"
          />
        )}
      </svg>
    </div>
  )
}
