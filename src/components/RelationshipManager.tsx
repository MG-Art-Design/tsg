import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UserProfile, RelationshipStatus } from '@/lib/types'
import { Users, Heart, Trophy, GraduationCap, Briefcase, House, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface RelationshipManagerProps {
  profile: UserProfile
  friends: UserProfile[]
  onUpdate: (updatedProfile: UserProfile) => void
  onUpdateFriend: (friendId: string, updatedFriend: UserProfile) => void
}

const RELATIONSHIP_OPTIONS: { value: RelationshipStatus; label: string; icon: any; color: string }[] = [
  { value: 'friend', label: 'Friend', icon: Heart, color: 'text-pink-400' },
  { value: 'rival', label: 'Rival', icon: Trophy, color: 'text-orange-400' },
  { value: 'mentor', label: 'Mentor', icon: GraduationCap, color: 'text-blue-400' },
  { value: 'mentee', label: 'Mentee', icon: GraduationCap, color: 'text-cyan-400' },
  { value: 'colleague', label: 'Colleague', icon: Briefcase, color: 'text-purple-400' },
  { value: 'family', label: 'Family', icon: House, color: 'text-green-400' },
  { value: 'other', label: 'Other', icon: Tag, color: 'text-gray-400' },
]

export function RelationshipManager({ profile, friends, onUpdate, onUpdateFriend }: RelationshipManagerProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const getRelationshipOption = (status: RelationshipStatus) => {
    return RELATIONSHIP_OPTIONS.find(opt => opt.value === status) || RELATIONSHIP_OPTIONS[0]
  }

  const handleUpdateRelationship = (friendId: string, newStatus: RelationshipStatus) => {
    const friend = friends.find(f => f.id === friendId)
    if (!friend) return

    const updatedProfile = {
      ...profile,
      relationshipStatuses: {
        ...profile.relationshipStatuses,
        [friendId]: newStatus
      }
    }

    onUpdate(updatedProfile)

    const reciprocalStatus = getReciprocalStatus(newStatus)
    const updatedFriend = {
      ...friend,
      relationshipStatuses: {
        ...friend.relationshipStatuses,
        [profile.id]: reciprocalStatus
      }
    }

    onUpdateFriend(friendId, updatedFriend)

    toast.success('Relationship updated', {
      description: `${friend.username} is now marked as ${newStatus}`
    })

    setEditingUserId(null)
  }

  const getReciprocalStatus = (status: RelationshipStatus): RelationshipStatus => {
    switch (status) {
      case 'mentor':
        return 'mentee'
      case 'mentee':
        return 'mentor'
      default:
        return status
    }
  }

  const getRelationshipStatus = (friendId: string): RelationshipStatus => {
    return profile.relationshipStatuses?.[friendId] || 'friend'
  }

  if (friends.length === 0) {
    return null
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Users size={24} weight="fill" className="text-accent" />
          Relationship Status
        </CardTitle>
        <CardDescription>
          Categorize your connections to organize your leaderboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {friends.map((friend) => {
            const status = getRelationshipStatus(friend.id)
            const option = getRelationshipOption(status)
            const Icon = option.icon
            const isEditing = editingUserId === friend.id

            return (
              <motion.div
                key={friend.id}
                layout
                className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg"
              >
                <div className="text-3xl">{friend.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{friend.username}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {!isEditing ? (
                      <Badge 
                        variant="outline" 
                        className={`${option.color} flex items-center gap-1`}
                      >
                        <Icon size={14} weight="fill" />
                        {option.label}
                      </Badge>
                    ) : (
                      <Select
                        value={status}
                        onValueChange={(value) => handleUpdateRelationship(friend.id, value as RelationshipStatus)}
                      >
                        <SelectTrigger className="w-[150px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_OPTIONS.map((opt) => {
                            const OptionIcon = opt.icon
                            return (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <OptionIcon size={16} weight="fill" className={opt.color} />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setEditingUserId(friend.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    onClick={() => setEditingUserId(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Done
                  </Button>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border">
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">
            Relationship Types
          </Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {RELATIONSHIP_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <div key={opt.value} className="flex items-center gap-2">
                  <Icon size={14} weight="fill" className={opt.color} />
                  <span>{opt.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
