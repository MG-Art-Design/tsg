import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: { width: 80, fontSize: 10, arrowScale: 0.6 },
  md: { width: 120, fontSize: 14, arrowScale: 0.8 },
  lg: { width: 180, fontSize: 20, arrowScale: 1 },
  xl: { width: 240, fontSize: 28, arrowScale: 1.3 }
}

export function Logo({ size = 'md', animated = true, className = '' }: LogoProps) {
  const dimensions = sizeMap[size]
  
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5 },
        opacity: { duration: 0.3 }
      }
    }
  }

  const arrowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1,
        duration: 0.5
      }
    }
  }

  return (
    <div className={`relative ${className}`} style={{ width: dimensions.width }}>
      <svg
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.75 0.15 195)" />
            <stop offset="50%" stopColor="oklch(0.65 0.24 330)" />
            <stop offset="100%" stopColor="oklch(0.75 0.15 195)" />
          </linearGradient>
          
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.24 330)" />
            <stop offset="100%" stopColor="oklch(0.75 0.15 195)" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <text
          x="10"
          y="25"
          fontFamily="Space Grotesk, sans-serif"
          fontSize={dimensions.fontSize}
          fontWeight="700"
          fill="url(#textGradient)"
          filter="url(#glow)"
          letterSpacing="-0.5"
        >
          THE
        </text>

        <text
          x="10"
          y="50"
          fontFamily="Space Grotesk, sans-serif"
          fontSize={dimensions.fontSize * 1.8}
          fontWeight="900"
          fill="url(#textGradient)"
          filter="url(#glow)"
          letterSpacing="-1"
        >
          STONK
        </text>

        <text
          x="10"
          y="75"
          fontFamily="Space Grotesk, sans-serif"
          fontSize={dimensions.fontSize * 1.8}
          fontWeight="900"
          fill="url(#textGradient)"
          filter="url(#glow)"
          letterSpacing="-1"
        >
          GAME
        </text>

        {animated ? (
          <motion.path
            d="M 30 70 L 80 40 L 130 50 L 180 20"
            stroke="url(#arrowGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
        ) : (
          <path
            d="M 30 70 L 80 40 L 130 50 L 180 20"
            stroke="url(#arrowGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {animated ? (
          <motion.g
            variants={arrowVariants}
            initial="hidden"
            animate="visible"
          >
            <polygon
              points="180,20 172,16 174,24"
              fill="url(#arrowGradient)"
              filter="url(#glow)"
            />
          </motion.g>
        ) : (
          <polygon
            points="180,20 172,16 174,24"
            fill="url(#arrowGradient)"
            filter="url(#glow)"
          />
        )}
      </svg>
    </div>
  )
}
