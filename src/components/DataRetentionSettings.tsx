import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { UserProfile, Portfolio, DataRetentionSettings as DataRetentionSettingsType, ActivityHistoryEntry } from '@/lib/types'
import { HardDrives, Trash, ShieldCheck, Warning, ClockClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatCurrency, formatPercent } from '@/lib/helpers'

interface DataRetentionSettingsProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export function DataRetentionSettings({ profile, onUpdate }: DataRetentionSettingsProps) {
  const [userPortfolios, setUserPortfolios] = useKV<Portfolio[]>('user-portfolios', [])
  const [activityHistory, setActivityHistory] = useKV<Record<string, ActivityHistoryEntry>>('activity-history', {})
  const [showDeletePortfoliosDialog, setShowDeletePortfoliosDialog] = useState(false)
  const [showDeleteActivityDialog, setShowDeleteActivityDialog] = useState(false)

  const settings: DataRetentionSettingsType = profile.dataRetentionSettings ?? {
    keepPortfolioHistoryIndefinitely: true,
    consentGiven: false,
    allowAutomaticDeletion: false
  }

  const portfolioCount = (userPortfolios || []).length
  const activityEntries = Object.values(activityHistory || {}).filter(h => h.userId === profile.id)

  const handleUpdateSettings = (updates: Partial<DataRetentionSettingsType>) => {
    const updated: DataRetentionSettingsType = {
      ...settings,
      ...updates,
      consentGiven: true,
      consentGivenAt: Date.now()
    }
    onUpdate({ ...profile, dataRetentionSettings: updated })
    toast.success('Data retention settings updated')
  }

  const handleDeletePortfolioHistory = () => {
    setUserPortfolios([])
    toast.success('Portfolio history deleted', {
      description: 'All portfolio historical data has been permanently removed.'
    })
    setShowDeletePortfoliosDialog(false)
  }

  const handleDeleteActivityHistory = () => {
    const remaining = Object.fromEntries(
      Object.entries(activityHistory || {}).filter(([, v]) => v.userId !== profile.id)
    )
    setActivityHistory(remaining)
    toast.success('Activity history deleted', {
      description: 'All activity history data has been permanently removed.'
    })
    setShowDeleteActivityDialog(false)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <HardDrives size={24} weight="fill" className="text-accent" />
          Data &amp; Portfolio History
        </CardTitle>
        <CardDescription>
          Control how your portfolio historicals and activity data are stored. Your data is never deleted without your explicit consent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Storage Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-1">
            <div className="text-2xl font-bold text-primary">{portfolioCount}</div>
            <div className="text-xs text-muted-foreground">Portfolios stored</div>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-1">
            <div className="text-2xl font-bold text-primary">{activityEntries.length}</div>
            <div className="text-xs text-muted-foreground">Activity records</div>
          </div>
        </div>

        {/* Retention Policy */}
        <div className="space-y-4 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck size={16} weight="fill" className="text-accent" />
            Retention Policy
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium cursor-pointer">Keep portfolio history indefinitely</Label>
              <p className="text-xs text-muted-foreground">
                Your historical portfolio data is preserved until you choose to delete it.
              </p>
            </div>
            <Switch
              checked={settings.keepPortfolioHistoryIndefinitely}
              onCheckedChange={(checked) =>
                handleUpdateSettings({
                  keepPortfolioHistoryIndefinitely: checked,
                  allowAutomaticDeletion: checked ? false : settings.allowAutomaticDeletion
                })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium cursor-pointer">Allow automatic data cleanup</Label>
              <p className="text-xs text-muted-foreground">
                Allows removal of data older than 2 years. You will receive a notification and must confirm before any automatic deletion occurs.
              </p>
            </div>
            <Switch
              checked={settings.allowAutomaticDeletion}
              onCheckedChange={(checked) =>
                handleUpdateSettings({
                  allowAutomaticDeletion: checked,
                  keepPortfolioHistoryIndefinitely: checked ? false : settings.keepPortfolioHistoryIndefinitely
                })
              }
            />
          </div>

          {settings.consentGiven && settings.consentGivenAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <ClockClockwise size={12} />
              Consent recorded on {new Date(settings.consentGivenAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Portfolio Historicals */}
        {portfolioCount > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Portfolio Historicals</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(userPortfolios || []).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-lg">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.quarter} &bull; {p.positions.length} positions</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-sm font-semibold">{formatCurrency(p.currentValue)}</div>
                    <Badge variant={p.totalReturnPercent >= 0 ? 'default' : 'destructive'} className="text-xs">
                      {formatPercent(p.totalReturnPercent)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="border border-destructive/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Warning size={16} weight="fill" />
            Delete My Data
          </div>
          <p className="text-xs text-muted-foreground">
            These actions are permanent and cannot be undone. Your data will not be deleted without your explicit confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeletePortfoliosDialog(true)}
              disabled={portfolioCount === 0}
            >
              <Trash size={14} className="mr-1.5" />
              Delete Portfolio History ({portfolioCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteActivityDialog(true)}
              disabled={activityEntries.length === 0}
            >
              <Trash size={14} className="mr-1.5" />
              Delete Activity History ({activityEntries.length})
            </Button>
          </div>
        </div>

      </CardContent>

      {/* Delete Portfolios Confirmation */}
      <AlertDialog open={showDeletePortfoliosDialog} onOpenChange={setShowDeletePortfoliosDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Portfolio History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {portfolioCount} portfolio(s) and their historical data. This action cannot be undone, and no automated process will restore it. You are giving explicit consent for this deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeletePortfolioHistory}
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Activity Confirmation */}
      <AlertDialog open={showDeleteActivityDialog} onOpenChange={setShowDeleteActivityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Activity History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {activityEntries.length} activity record(s). This action cannot be undone. You are giving explicit consent for this deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteActivityHistory}
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  )
}
