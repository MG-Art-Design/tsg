import { Card, CardContent } from '@/components/ui/card'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  variant?: 'default' | 'minimal' | 'fullscreen'
  className?: string
}

export function LoadingState({ message, variant = 'default', className }: LoadingStateProps) {
  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <CircleNotch size={48} className="animate-spin text-primary mx-auto" />
          {message && <p className="text-muted-foreground">{message}</p>}
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <CircleNotch size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CircleNotch size={40} className="animate-spin text-primary mb-4" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  )
}

interface InlineLoadingProps {
  size?: number
  className?: string
}

export function InlineLoading({ size = 16, className }: InlineLoadingProps) {
  return <CircleNotch size={size} className={cn("animate-spin", className)} />
}
