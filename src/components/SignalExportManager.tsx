import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  SignalExportConfig, 
  SignalExportMessage,
  formatSignalExport,
  generateSignalExportInstructions,
  generateLeaderboardTrashTalk,
  generatePerformancePraise,
  generateChatExportSummary
} from '@/lib/signalHelpers'
import { ChatMessage, LeaderboardEntry, Portfolio, Group, UserProfile } from '@/lib/types'
import { useScheduledSignalExports } from '@/hooks/use-scheduled-signal-exports'
import { Copy, Download, Lightning, Trophy, ChatCircle, Fire, Bell, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SignalExportManagerProps {
  group: Group
  groupChats: ChatMessage[]
  groupLeaderboard: LeaderboardEntry[]
  allPortfolios: Record<string, Portfolio>
  allUsers: Record<string, UserProfile>
  currentUser: UserProfile
}

export function SignalExportManager({
  group,
  groupChats,
  groupLeaderboard,
  allPortfolios,
  allUsers,
  currentUser
}: SignalExportManagerProps) {
  const [config, setConfig] = useKV<SignalExportConfig>(`signal-export-config-${group.id}`, {
    groupId: group.id,
    phoneNumber: '',
    groupName: group.name,
    enabled: false,
    includeLeaderboardUpdates: true,
    includeTrashTalk: true,
    trashTalkIntensity: 'moderate',
    updateFrequency: 'daily',
    automaticLeaderboardUpdates: {
      enabled: false,
      daily: false,
      weekly: false,
      monthly: false
    }
  })

  const [previousLeaderboard, setPreviousLeaderboard] = useKV<LeaderboardEntry[]>(
    `signal-prev-leaderboard-${group.id}`,
    []
  )
  
  const [exportMessages, setExportMessages] = useState<SignalExportMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedExport, setGeneratedExport] = useState<string>('')
  const [instructions, setInstructions] = useState<string>('')
  const [scheduledExportType, setScheduledExportType] = useState<'daily' | 'weekly' | 'monthly' | null>(null)

  const isGroupAdmin = group.createdBy === currentUser.id

  const handleScheduledExport = useCallback((type: 'daily' | 'weekly' | 'monthly') => {
    setScheduledExportType(type)
    generateExport()
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} leaderboard update ready!`, {
      description: 'Your scheduled export has been generated. Check the Export tab to copy it to Signal.',
      duration: 10000,
      action: {
        label: 'View',
        onClick: () => {
          const tabTrigger = document.querySelector('[value="export"]') as HTMLElement
          tabTrigger?.click()
        }
      }
    })
  }, [])

  useScheduledSignalExports(config || null, handleScheduledExport)

  const handleUpdateConfig = (updates: Partial<SignalExportConfig>) => {
    setConfig(current => ({ ...current!, ...updates }))
  }

  const generateExport = async () => {
    if (!config) return
    
    setIsGenerating(true)
    const messages: SignalExportMessage[] = []

    try {
      if (config.includeLeaderboardUpdates && groupLeaderboard.length > 0) {
        const leaderboardSummary: SignalExportMessage = {
          id: `leaderboard-${Date.now()}`,
          groupId: group.id,
          timestamp: Date.now(),
          type: 'leaderboard',
          content: `🏆 Current Standings:\n${groupLeaderboard.slice(0, 5).map((e, i) => 
            `${i + 1}. ${e.username}: ${e.returnPercent > 0 ? '+' : ''}${e.returnPercent.toFixed(2)}%`
          ).join('\n')}`
        }
        messages.push(leaderboardSummary)

        if (config.includeTrashTalk) {
          const trashTalk = await generateLeaderboardTrashTalk(
            groupLeaderboard,
            config.trashTalkIntensity,
            previousLeaderboard && previousLeaderboard.length > 0 ? previousLeaderboard : undefined
          )

          trashTalk.forEach((content, idx) => {
            messages.push({
              id: `trash-talk-${Date.now()}-${idx}`,
              groupId: group.id,
              timestamp: Date.now() + idx,
              type: 'trash-talk',
              content
            })
          })
        }

        setPreviousLeaderboard(groupLeaderboard)
      }

      const topPerformer = groupLeaderboard[0]
      if (topPerformer && allPortfolios[topPerformer.userId]) {
        const portfolio = allPortfolios[topPerformer.userId]
        const user = allUsers[topPerformer.userId]
        
        if (user && portfolio) {
          const praise = await generatePerformancePraise(user, portfolio)
          messages.push({
            id: `praise-${Date.now()}`,
            groupId: group.id,
            timestamp: Date.now(),
            type: 'praise',
            content: praise,
            metadata: {
              userId: user.id,
              username: user.username,
              changePercent: portfolio.totalReturnPercent,
              rank: 1
            }
          })
        }
      }

      if (groupChats.length > 0) {
        const chatSummary = await generateChatExportSummary(groupChats, 10)
        messages.push({
          id: `chat-summary-${Date.now()}`,
          groupId: group.id,
          timestamp: Date.now(),
          type: 'chat',
          content: chatSummary
        })
      }

      setExportMessages(messages)
      
      const formatted = formatSignalExport(messages, group.name, false)
      setGeneratedExport(formatted)
      
      const inst = await generateSignalExportInstructions(config.phoneNumber || 'your-number', formatted)
      setInstructions(inst)

      toast.success('Export generated!', {
        description: `${messages.length} messages ready to copy`
      })
    } catch (error) {
      console.error('Failed to generate export:', error)
      toast.error('Failed to generate export', {
        description: 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const downloadAsText = () => {
    const blob = new Blob([generatedExport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tsg-${group.name.replace(/\s+/g, '-')}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Download started')
  }

  if (!isGroupAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning size={24} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            Signal Export
          </CardTitle>
          <CardDescription>Only the group admin can configure Signal exports</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightning size={24} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
          Signal Export Manager
        </CardTitle>
        <CardDescription>
          Export group activity, leaderboard updates, and AI trash talk to your Signal group chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="export">Generate Export</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable Signal Export</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically prepare exports based on group activity
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={config?.enabled}
                  onCheckedChange={(checked) => handleUpdateConfig({ enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">Your Phone Number (Optional)</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 555-123-4567"
                  value={config?.phoneNumber || ''}
                  onChange={(e) => handleUpdateConfig({ phoneNumber: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used for CLI instructions - not required for manual copy/paste
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-frequency">Update Frequency</Label>
                <Select
                  value={config?.updateFrequency}
                  onValueChange={(value: 'instant' | 'hourly' | 'daily') => 
                    handleUpdateConfig({ updateFrequency: value })
                  }
                >
                  <SelectTrigger id="update-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant (1 min throttle)</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="leaderboard-updates">Include Leaderboard Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show current standings and rank changes
                  </p>
                </div>
                <Switch
                  id="leaderboard-updates"
                  checked={config?.includeLeaderboardUpdates}
                  onCheckedChange={(checked) => 
                    handleUpdateConfig({ includeLeaderboardUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trash-talk">
                    Enable AI Trash Talk <Fire className="inline" size={16} weight="fill" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Let the AI roast poor performers and praise leaders
                  </p>
                </div>
                <Switch
                  id="trash-talk"
                  checked={config?.includeTrashTalk}
                  onCheckedChange={(checked) => 
                    handleUpdateConfig({ includeTrashTalk: checked })
                  }
                />
              </div>

              {config?.includeTrashTalk && (
                <div className="space-y-2">
                  <Label htmlFor="intensity">Trash Talk Intensity</Label>
                  <Select
                    value={config?.trashTalkIntensity}
                    onValueChange={(value: 'mild' | 'moderate' | 'savage') => 
                      handleUpdateConfig({ trashTalkIntensity: value })
                    }
                  >
                    <SelectTrigger id="intensity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">😊 Mild - Friendly banter</SelectItem>
                      <SelectItem value="moderate">🔥 Moderate - Competitive sass</SelectItem>
                      <SelectItem value="savage">💀 Savage - No mercy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="border-t pt-4 mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-leaderboard">Automatic Leaderboard Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Schedule regular leaderboard updates to Signal chat
                      </p>
                    </div>
                    <Switch
                      id="auto-leaderboard"
                      checked={config?.automaticLeaderboardUpdates?.enabled}
                      onCheckedChange={(checked) => 
                        handleUpdateConfig({ 
                          automaticLeaderboardUpdates: {
                            ...config?.automaticLeaderboardUpdates!,
                            enabled: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>

                {config?.automaticLeaderboardUpdates?.enabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-[oklch(0.70_0.14_75_/_0.3)]">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="daily-updates">Daily Updates</Label>
                        <p className="text-xs text-muted-foreground">
                          Send leaderboard update every day
                        </p>
                      </div>
                      <Switch
                        id="daily-updates"
                        checked={config?.automaticLeaderboardUpdates?.daily}
                        onCheckedChange={(checked) => 
                          handleUpdateConfig({ 
                            automaticLeaderboardUpdates: {
                              ...config?.automaticLeaderboardUpdates!,
                              daily: checked
                            }
                          })
                        }
                      />
                    </div>

                    {config?.automaticLeaderboardUpdates?.daily && (
                      <div className="space-y-2">
                        <Label htmlFor="daily-time">Daily Update Time</Label>
                        <Input
                          id="daily-time"
                          type="time"
                          value={config?.automaticLeaderboardUpdates?.dailyTime || '09:00'}
                          onChange={(e) => 
                            handleUpdateConfig({ 
                              automaticLeaderboardUpdates: {
                                ...config?.automaticLeaderboardUpdates!,
                                dailyTime: e.target.value
                              }
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Time is in your local timezone
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-updates">Weekly Updates</Label>
                        <p className="text-xs text-muted-foreground">
                          Send leaderboard update once a week
                        </p>
                      </div>
                      <Switch
                        id="weekly-updates"
                        checked={config?.automaticLeaderboardUpdates?.weekly}
                        onCheckedChange={(checked) => 
                          handleUpdateConfig({ 
                            automaticLeaderboardUpdates: {
                              ...config?.automaticLeaderboardUpdates!,
                              weekly: checked
                            }
                          })
                        }
                      />
                    </div>

                    {config?.automaticLeaderboardUpdates?.weekly && (
                      <div className="space-y-2">
                        <Label htmlFor="weekly-day">Day of Week</Label>
                        <Select
                          value={config?.automaticLeaderboardUpdates?.weeklyDay || 'monday'}
                          onValueChange={(value: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday') => 
                            handleUpdateConfig({ 
                              automaticLeaderboardUpdates: {
                                ...config?.automaticLeaderboardUpdates!,
                                weeklyDay: value
                              }
                            })
                          }
                        >
                          <SelectTrigger id="weekly-day">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>

                        <Label htmlFor="weekly-time">Weekly Update Time</Label>
                        <Input
                          id="weekly-time"
                          type="time"
                          value={config?.automaticLeaderboardUpdates?.weeklyTime || '09:00'}
                          onChange={(e) => 
                            handleUpdateConfig({ 
                              automaticLeaderboardUpdates: {
                                ...config?.automaticLeaderboardUpdates!,
                                weeklyTime: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="monthly-updates">Monthly Updates</Label>
                        <p className="text-xs text-muted-foreground">
                          Send leaderboard update once a month
                        </p>
                      </div>
                      <Switch
                        id="monthly-updates"
                        checked={config?.automaticLeaderboardUpdates?.monthly}
                        onCheckedChange={(checked) => 
                          handleUpdateConfig({ 
                            automaticLeaderboardUpdates: {
                              ...config?.automaticLeaderboardUpdates!,
                              monthly: checked
                            }
                          })
                        }
                      />
                    </div>

                    {config?.automaticLeaderboardUpdates?.monthly && (
                      <div className="space-y-2">
                        <Label htmlFor="monthly-day">Day of Month</Label>
                        <Select
                          value={config?.automaticLeaderboardUpdates?.monthlyDay?.toString() || '1'}
                          onValueChange={(value) => 
                            handleUpdateConfig({ 
                              automaticLeaderboardUpdates: {
                                ...config?.automaticLeaderboardUpdates!,
                                monthlyDay: parseInt(value)
                              }
                            })
                          }
                        >
                          <SelectTrigger id="monthly-day">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Label htmlFor="monthly-time">Monthly Update Time</Label>
                        <Input
                          id="monthly-time"
                          type="time"
                          value={config?.automaticLeaderboardUpdates?.monthlyTime || '09:00'}
                          onChange={(e) => 
                            handleUpdateConfig({ 
                              automaticLeaderboardUpdates: {
                                ...config?.automaticLeaderboardUpdates!,
                                monthlyTime: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
                      <p className="text-muted-foreground">
                        <strong>Note:</strong> Automatic updates will generate and prepare leaderboard exports based on your schedule. 
                        You'll still need to manually copy and send them to your Signal group, or use the Signal CLI if configured.
                      </p>
                      
                      {(config?.automaticLeaderboardUpdates?.daily || 
                        config?.automaticLeaderboardUpdates?.weekly || 
                        config?.automaticLeaderboardUpdates?.monthly) && (
                        <div className="pt-2 border-t border-border">
                          <p className="font-semibold mb-1 flex items-center gap-2">
                            <Clock size={16} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                            Active Schedules:
                          </p>
                          <ul className="space-y-1 ml-6 text-muted-foreground">
                            {config?.automaticLeaderboardUpdates?.daily && (
                              <li>• Daily at {config?.automaticLeaderboardUpdates?.dailyTime || '09:00'}</li>
                            )}
                            {config?.automaticLeaderboardUpdates?.weekly && (
                              <li>• Weekly on {config?.automaticLeaderboardUpdates?.weeklyDay?.charAt(0).toUpperCase()}{config?.automaticLeaderboardUpdates?.weeklyDay?.slice(1)} at {config?.automaticLeaderboardUpdates?.weeklyTime || '09:00'}</li>
                            )}
                            {config?.automaticLeaderboardUpdates?.monthly && (
                              <li>• Monthly on the {config?.automaticLeaderboardUpdates?.monthlyDay}{config?.automaticLeaderboardUpdates?.monthlyDay === 1 ? 'st' : config?.automaticLeaderboardUpdates?.monthlyDay === 2 ? 'nd' : config?.automaticLeaderboardUpdates?.monthlyDay === 3 ? 'rd' : 'th'} at {config?.automaticLeaderboardUpdates?.monthlyTime || '09:00'}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {scheduledExportType && exportMessages.length > 0 && (
              <Alert className="border-[oklch(0.70_0.14_75)] bg-[oklch(0.65_0.12_75_/_0.1)]">
                <Bell size={18} weight="fill" className="text-[oklch(0.70_0.14_75)]" />
                <AlertTitle>Scheduled {scheduledExportType.charAt(0).toUpperCase() + scheduledExportType.slice(1)} Update Ready!</AlertTitle>
                <AlertDescription>
                  Your automatic leaderboard update has been generated and is ready to copy to Signal.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-1">Generate Export</h3>
                <p className="text-sm text-muted-foreground">
                  Create a fresh export with current data
                </p>
              </div>
              <Button
                onClick={generateExport}
                disabled={isGenerating || !config?.enabled}
                className="gap-2"
              >
                <Lightning size={18} weight="fill" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>

            {exportMessages.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Trophy size={14} weight="fill" />
                    {exportMessages.filter(m => m.type === 'leaderboard').length} Leaderboard
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Fire size={14} weight="fill" />
                    {exportMessages.filter(m => m.type === 'trash-talk').length} Trash Talk
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <ChatCircle size={14} weight="fill" />
                    {exportMessages.filter(m => m.type === 'chat').length} Chat
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {generatedExport}
                    </pre>
                  </ScrollArea>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(generatedExport)}
                    className="gap-2 flex-1"
                  >
                    <Copy size={18} />
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={downloadAsText}
                    variant="secondary"
                    className="gap-2 flex-1"
                  >
                    <Download size={18} />
                    Download
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea
                    value={instructions}
                    readOnly
                    className="font-mono text-xs h-32"
                  />
                </div>
              </div>
            )}

            {exportMessages.length === 0 && !isGenerating && (
              <div className="text-center py-12 text-muted-foreground">
                <Lightning size={48} weight="thin" className="mx-auto mb-4 opacity-50" />
                <p>Click "Generate" to create your first export</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
