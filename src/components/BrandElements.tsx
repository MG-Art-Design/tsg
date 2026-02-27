import { motion } from 'framer-motion'

interface ChartPatternProps {
  variant?: 'up' | 'down' | 'volatile'
  className?: string
  animated?: boolean
}

export function ChartPattern({ variant = 'up', className = '', animated = true }: ChartPatternProps) {
  const paths = {
    up: 'M 0 80 L 25 60 L 50 40 L 75 30 L 100 10',
    down: 'M 0 20 L 25 40 L 50 60 L 75 70 L 100 90',
    volatile: 'M 0 50 L 20 30 L 40 60 L 60 20 L 80 70 L 100 40'
  }

  const gradientIds = {
    up: 'chartGradientUp',
    down: 'chartGradientDown',
    volatile: 'chartGradientVolatile'
  }

  const colors = {
    up: { start: 'oklch(0.70 0.12 145)', end: 'oklch(0.72 0.06 210)' },
    down: { start: 'oklch(0.58 0.18 25)', end: 'oklch(0.68 0.08 220)' },
    volatile: { start: 'oklch(0.68 0.08 220)', end: 'oklch(0.72 0.06 210)' }
  }

  const pathVariants = animated ? {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2 }
    }
  } : undefined

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientIds[variant]} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors[variant].start} />
          <stop offset="100%" stopColor={colors[variant].end} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {animated ? (
        <motion.path
          d={paths[variant]}
          stroke={`url(#${gradientIds[variant]})`}
          strokeWidth="2"
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
          d={paths[variant]}
          stroke={`url(#${gradientIds[variant]})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
      )}
    </svg>
  )
}

interface BrandBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'success' | 'warning'
  className?: string
}

export function BrandBadge({ children, variant = 'primary', className = '' }: BrandBadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/30',
    accent: 'bg-accent/10 text-accent border-accent/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-destructive/10 text-destructive border-destructive/30'
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg border font-space font-semibold text-sm tracking-wide uppercase ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export function StatCard({ label, value, change, trend = 'neutral', icon }: StatCardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 group hover:border-primary/50 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <ChartPattern variant={trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'volatile'} animated={false} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          {icon && <div className="text-primary">{icon}</div>}
        </div>

        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-bold font-space">{value}</p>
          {change !== undefined && (
            <span className={`text-sm font-semibold ${trendColors[trend]}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface BrandDividerProps {
  text?: string
  variant?: 'gradient' | 'solid'
}

export function BrandDivider({ text, variant = 'gradient' }: BrandDividerProps) {
  return (
    <div className="relative flex items-center py-4">
      <div
        className={`flex-grow h-px ${
          variant === 'gradient'
            ? 'bg-gradient-to-r from-transparent via-primary to-transparent'
            : 'bg-border'
        }`}
      />
      {text && (
        <>
          <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {text}
          </span>
          <div
            className={`flex-grow h-px ${
              variant === 'gradient'
                ? 'bg-gradient-to-r from-primary via-accent to-transparent'
                : 'bg-border'
            }`}
          />
        </>
      )}
    </div>
  )
}
