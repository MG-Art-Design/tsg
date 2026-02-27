import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserProfile } from '@/lib/types'
import { UserPlus, X, Copy, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface FriendsManagerProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export function FriendsManager({ profile, onUpdate }: FriendsManagerProps) {
  const [allUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [friendCode, setFriendCode] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  const friends = profile.friendIds
    .map(id => allUsers?.[id])
    .filter(Boolean) as UserProfile[]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.friendCode)
    setCopied(true)
    toast.success('Friend code copied!', {
      description: 'Share this code with friends to add them to your leaderboard.'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddFriend = () => {
    const trimmedCode = friendCode.trim().toUpperCase()
    
    if (!trimmedCode) {
      toast.error('Enter a friend code')
      return
    }

    if (trimmedCode === profile.friendCode) {
      toast.error('Cannot add yourself as a friend')
      setFriendCode('')
      return
    }

    const friendUser = Object.values(allUsers || {}).find(
      user => user.friendCode === trimmedCode
    )

    if (!friendUser) {
      toast.error('Friend not found', {
        description: 'Check the code and try again.'
      })
      return
    }

    if (profile.friendIds.includes(friendUser.id)) {
      toast.info('Already friends', {
        description: `${friendUser.username} is already on your leaderboard.`
      })
      setFriendCode('')
      return
    }

    const updatedProfile = {
      ...profile,
      friendIds: [...profile.friendIds, friendUser.id]
    }

    const updatedFriend = {
      ...friendUser,
      friendIds: [...friendUser.friendIds, profile.id]
    }

    onUpdate(updatedProfile)

    setTimeout(async () => {
      const currentAllUsers = await window.spark.kv.get<Record<string, UserProfile>>('all-users')
      await window.spark.kv.set('all-users', {
        ...(currentAllUsers || {}),
        [friendUser.id]: updatedFriend
      })
    }, 100)

    toast.success(`Added ${friendUser.username}!`, {
      description: `${friendUser.avatar} ${friendUser.username} is now on your leaderboard.`
    })

    setFriendCode('')
    setIsAdding(false)
  }

  const handleRemoveFriend = (friendId: string) => {
    const friend = allUsers?.[friendId]
    if (!friend) return

    const updatedProfile = {
      ...profile,
      friendIds: profile.friendIds.filter(id => id !== friendId)
    }

    const updatedFriend = {
      ...friend,
      friendIds: friend.friendIds.filter(id => id !== profile.id)
    }

    onUpdate(updatedProfile)

    setTimeout(async () => {
      const currentAllUsers = await window.spark.kv.get<Record<string, UserProfile>>('all-users')
      await window.spark.kv.set('all-users', {
        ...(currentAllUsers || {}),
        [friendId]: updatedFriend
      })
    }, 100)

    toast.info(`Removed ${friend.username}`, {
      description: 'They will no longer appear on your leaderboard.'
    })
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UserPlus size={24} weight="fill" className="text-accent" />
          Friends
        </CardTitle>
        <CardDescription>
          Add friends to compete on your personal leaderboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Your Friend Code</Label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-lg font-bold text-primary">
              {profile.friendCode}
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="lg"
              className="px-4"
            >
              {copied ? (
                <Check size={20} weight="bold" className="text-success" />
              ) : (
                <Copy size={20} />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this code with friends so they can add you to their leaderboard
          </p>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          {!isAdding ? (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full"
            >
              <UserPlus size={18} weight="fill" className="mr-2" />
              Add Friend
            </Button>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="friend-code" className="text-sm font-medium">
                Enter Friend Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="friend-code"
                  placeholder="TSG-12345678"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                  className="font-mono"
                  maxLength={12}
                />
                <Button onClick={handleAddFriend} size="lg">
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setFriendCode('')
                  }}
                  variant="ghost"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {friends.length > 0 && (
          <div className="border-t border-border pt-6 space-y-3">
            <Label className="text-sm font-medium">Your Friends ({friends.length})</Label>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {friends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
                      <div className="text-3xl">{friend.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{friend.username}</div>
                        {friend.bio && (
                          <div className="text-xs text-muted-foreground truncate">
                            {friend.bio}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRemoveFriend(friend.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X size={18} weight="bold" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {friends.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No friends added yet</p>
            <p className="text-xs mt-1">Add friends to see them on your leaderboard</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
