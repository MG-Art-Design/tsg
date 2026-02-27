import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupChat } from '@/components/GroupChat'
import { Group, UserProfile, GroupInvite } from '@/lib/types'
import { generateInviteCode } from '@/lib/helpers'
import { Users, Plus, Copy, UserPlus, Check, X, ChatCircle, ArrowLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GroupsProps {
  currentUser: UserProfile
  onUserUpdate: (updatedUser: UserProfile) => void
}

export function Groups({ currentUser, onUserUpdate }: GroupsProps) {
  const [groups, setGroups] = useKV<Record<string, Group>>('all-groups', {})
  const [allUsers, setAllUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [invites, setInvites] = useKV<GroupInvite[]>('group-invites', [])
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedGroupChat, setSelectedGroupChat] = useState<Group | null>(null)

  const userGroups = currentUser.groupIds
    .map(id => groups?.[id])
    .filter(Boolean) as Group[]

  const pendingInvites = (invites || []).filter(
    inv => inv.status === 'pending' && 
    currentUser.groupIds.includes(inv.groupId) === false
  )

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required')
      return
    }

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      createdBy: currentUser.id,
      createdAt: Date.now(),
      memberIds: [currentUser.id],
      inviteCode: generateInviteCode(),
    }

    setGroups(current => ({ ...current, [newGroup.id]: newGroup }))
    
    onUserUpdate({
      ...currentUser,
      groupIds: [...currentUser.groupIds, newGroup.id]
    })

    setAllUsers(current => ({
      ...current,
      [currentUser.id]: {
        ...currentUser,
        groupIds: [...currentUser.groupIds, newGroup.id]
      }
    }))

    toast.success(`Group "${newGroup.name}" created! 🎉`, {
      description: `Share code ${newGroup.inviteCode} with your friends`
    })

    setNewGroupName('')
    setNewGroupDescription('')
    setCreateDialogOpen(false)
  }

  const handleJoinGroup = () => {
    const code = inviteCodeInput.trim().toUpperCase()
    if (!code) {
      toast.error('Enter an invite code')
      return
    }

    const group = Object.values(groups || {}).find(g => g.inviteCode === code)
    
    if (!group) {
      toast.error('Invalid invite code')
      return
    }

    if (currentUser.groupIds.includes(group.id)) {
      toast.error("You're already in this group")
      return
    }

    setGroups(current => ({
      ...current,
      [group.id]: {
        ...group,
        memberIds: [...group.memberIds, currentUser.id]
      }
    }))

    onUserUpdate({
      ...currentUser,
      groupIds: [...currentUser.groupIds, group.id]
    })

    setAllUsers(current => ({
      ...current,
      [currentUser.id]: {
        ...currentUser,
        groupIds: [...currentUser.groupIds, group.id]
      }
    }))

    toast.success(`Welcome to ${group.name}! 🎊`, {
      description: 'Time to show them what you got'
    })

    setInviteCodeInput('')
    setJoinDialogOpen(false)
  }

  const handleCopyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Invite code copied!', {
      description: 'Share it with your friends'
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleAcceptInvite = (invite: GroupInvite) => {
    const group = groups?.[invite.groupId]
    if (!group) return

    setGroups(current => ({
      ...(current || {}),
      [group.id]: {
        ...group,
        memberIds: [...group.memberIds, currentUser.id]
      }
    }))

    onUserUpdate({
      ...currentUser,
      groupIds: [...currentUser.groupIds, group.id]
    })

    setInvites(current => 
      (current || []).map(inv => 
        inv.id === invite.id ? { ...inv, status: 'accepted' as const } : inv
      )
    )

    toast.success(`You joined ${group.name}! 🎉`)
  }

  const handleDeclineInvite = (invite: GroupInvite) => {
    setInvites(current => 
      (current || []).map(inv => 
        inv.id === invite.id ? { ...inv, status: 'declined' as const } : inv
      )
    )
    toast.info('Invite declined')
  }

  return (
    <div className="space-y-6">
      {selectedGroupChat ? (
        <div>
          <Button
            variant="ghost"
            onClick={() => setSelectedGroupChat(null)}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={18} />
            Back to Groups
          </Button>
          <GroupChat
            groupId={selectedGroupChat.id}
            groupName={selectedGroupChat.name}
            currentUser={currentUser}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Your Groups</h2>
              <p className="text-muted-foreground">Compete with friends and chat together</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserPlus size={18} />
                    Join Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Group</DialogTitle>
                    <DialogDescription>
                      Enter the invite code shared by your friend
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-code">Invite Code</Label>
                      <Input
                        id="invite-code"
                        placeholder="ABC123"
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                        className="font-mono text-lg tracking-wider"
                        maxLength={6}
                      />
                    </div>
                    <Button onClick={handleJoinGroup} className="w-full">
                      Join Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-accent">
                    <Plus size={18} weight="bold" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Group</DialogTitle>
                    <DialogDescription>
                      Start your own trading competition with friends
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        placeholder="Wall Street Warriors"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        maxLength={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-description">Description (Optional)</Label>
                      <Textarea
                        id="group-description"
                        placeholder="The most elite traders in the game..."
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        rows={3}
                        maxLength={150}
                      />
                    </div>
                    <Button onClick={handleCreateGroup} className="w-full">
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {pendingInvites.length > 0 && (
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus size={20} />
                  Pending Invites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{invite.invitedByAvatar}</div>
                      <div>
                        <p className="font-semibold">{invite.groupName}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited by {invite.invitedByUsername}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvite(invite)}
                        className="gap-1"
                      >
                        <Check size={16} />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineInvite(invite)}
                        className="gap-1"
                      >
                        <X size={16} />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {userGroups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Groups Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Create a group or join one with an invite code to start competing with friends
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus size={18} />
                    Create Group
                  </Button>
                  <Button onClick={() => setJoinDialogOpen(true)} variant="outline" className="gap-2">
                    <UserPlus size={18} />
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userGroups.map(group => (
                <Card key={group.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {group.name}
                          {group.createdBy === currentUser.id && (
                            <Badge variant="secondary" className="text-xs">Owner</Badge>
                          )}
                        </CardTitle>
                        {group.description && (
                          <CardDescription className="mt-2">{group.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users size={16} />
                      <span>{group.memberIds.length} {group.memberIds.length === 1 ? 'member' : 'members'}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Invite Code</Label>
                      <div className="flex gap-2">
                        <Input
                          value={group.inviteCode}
                          readOnly
                          className="font-mono text-lg tracking-wider"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleCopyInviteCode(group.inviteCode)}
                          className="shrink-0"
                        >
                          {copiedCode === group.inviteCode ? (
                            <Check size={18} className="text-success" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedGroupChat(group)}
                      className="w-full gap-2"
                      variant="secondary"
                    >
                      <ChatCircle size={18} weight="fill" />
                      Open Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
