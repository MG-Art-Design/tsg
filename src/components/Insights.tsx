import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightning, TrendUp, ChartLine, Warning, Trophy } from '@phosphor-icons/react'
import { Insight } from '@/lib/types'
import { motion } from 'framer-motion'

interface InsightsProps {
  insights: Insight[]
}

const categoryConfig = {
  'market-trend': {
    icon: ChartLine,
    label: 'Market Trend',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20'
  },
  'portfolio-tip': {
    icon: Lightning,
    label: 'Portfolio Tip',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20'
  },
  'risk-alert': {
    icon: Warning,
    label: 'Risk Alert',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20'
  },
  'winner-spotlight': {
    icon: Trophy,
    label: 'Winner Spotlight',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20'
  }
}

export function Insights({ insights }: InsightsProps) {
  const sortedInsights = [...insights].sort((a, b) => b.timestamp - a.timestamp)

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[oklch(0.70_0.14_75)]">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Lightning size={24} weight="fill" className="text-accent sm:w-7 sm:h-7" />
            Market Insights
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            AI-powered analysis, delivered with just the right amount of sass. Stay sharp out there.
          </p>
        </CardHeader>
      </Card>

      {sortedInsights.length === 0 ? (
        <Card className="border-2 border-[oklch(0.70_0.14_75)]">
          <CardContent className="py-12 text-center">
            <Lightning size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No insights yet. Check back soon for market wisdom.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedInsights.map((insight, i) => {
            const config = categoryConfig[insight.category]
            const Icon = config.icon

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className={`border-2 border-[oklch(0.70_0.14_75)]/50 ${!insight.read ? 'ring-2 ring-primary/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon size={20} weight="fill" className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(insight.timestamp)}
                          </span>
                          {!insight.read && (
                            <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {insight.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
