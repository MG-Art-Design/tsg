import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Organization, UserProfile, OrganizationInvite } from '@/lib/types'
import { Building, Plus, UserPlus, Crown, ShieldCheck, User as UserIcon, X, Check, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface OrganizationManagerProps {
  currentUser: UserProfile
  onUserUpdate: (updatedUser: UserProfile) => void
}

export function OrganizationManager({ currentUser, onUserUpdate }: OrganizationManagerProps) {
  const [organizations, setOrganizations] = useKV<Record<string, Organization>>('all-organizations', {})
  const [allUsers, setAllUsers] = useKV<Record<string, UserProfile>>('all-users', {})
  const [invites, setInvites] = useKV<OrganizationInvite[]>('organization-invites', [])
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDescription, setNewOrgDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  const userOrganization = currentUser.organizationId ? organizations?.[currentUser.organizationId] : null

  const pendingInvites = (invites || []).filter(
    inv => inv.status === 'pending' && 
    inv.email === currentUser.emailNotifications.email &&
    new Date(inv.expiresAt) > new Date()
  )

  useEffect(() => {
    const now = Date.now()
    setInvites((current) => 
      (current || []).map(inv => 
        inv.expiresAt < now && inv.status === 'pending' 
          ? { ...inv, status: 'expired' as const }
          : inv
      )
    )
  }, [])

  const handleCreateOrganization = () => {
    if (!newOrgName.trim()) {
      toast.error('Organization name is required')
      return
    }

    if (currentUser.organizationId) {
      toast.error('You must leave your current organization first')
      return
    }

    const newOrg: Organization = {
      id: Date.now().toString(),
      name: newOrgName.trim(),
      description: newOrgDescription.trim(),
      createdBy: currentUser.id,
      createdAt: Date.now(),
      memberIds: [currentUser.id],
      adminIds: [currentUser.id],
      settings: {
        allowMemberInvites: false,
        requireAdminApproval: true,
        defaultInsightFrequency: 'weekly',
        sharedGroups: true,
        sharedLeaderboard: true
      },
      subscription: {
        tier: 'team',
        seats: 10,
        usedSeats: 1,
        startDate: Date.now(),
        autoRenew: true,
        features: {
          unlimitedGroups: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
          ssoEnabled: false,
          dedicatedSupport: false,
          dataExport: true,
          auditLogs: false
        }
      }
    }

    setOrganizations((current) => ({ ...(current || {}), [newOrg.id]: newOrg }))
    
    const updatedUser = {
      ...currentUser,
      organizationId: newOrg.id,
      organizationRole: 'owner' as const
    }

    onUserUpdate(updatedUser)

    setAllUsers((current) => ({
      ...(current || {}),
      [currentUser.id]: updatedUser
    }))

    toast.success(`Organization "${newOrg.name}" created! 🎉`, {
      description: 'You can now invite team members to join'
    })

    setNewOrgName('')
    setNewOrgDescription('')
    setCreateDialogOpen(false)
  }

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Email address is required')
      return
    }

    if (!userOrganization) {
      toast.error('No organization selected')
      return
    }

    const isAdmin = userOrganization.adminIds.includes(currentUser.id)
    const canInvite = isAdmin || userOrganization.settings.allowMemberInvites

    if (!canInvite) {
      toast.error('You do not have permission to invite members')
      return
    }

    if (userOrganization.subscription.usedSeats >= userOrganization.subscription.seats) {
      toast.error('Organization has reached maximum seats')
      return
    }

    const existingInvite = (invites || []).find(
      inv => inv.organizationId === userOrganization.id &&
      inv.email === inviteEmail.trim() &&
      inv.status === 'pending'
    )

    if (existingInvite) {
      toast.error('An invitation has already been sent to this email')
      return
    }

    const newInvite: OrganizationInvite = {
      id: Date.now().toString(),
      organizationId: userOrganization.id,
      organizationName: userOrganization.name,
      invitedBy: currentUser.id,
      invitedByUsername: currentUser.username,
      email: inviteEmail.trim(),
      role: inviteRole,
      invitedAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      status: 'pending'
    }

    setInvites((current) => [...(current || []), newInvite])

    toast.success('Invitation sent! 📧', {
      description: `An invite was sent to ${inviteEmail}`
    })

    setInviteEmail('')
    setInviteRole('member')
    setInviteDialogOpen(false)
  }

  const handleAcceptInvite = (invite: OrganizationInvite) => {
    if (currentUser.organizationId) {
      toast.error('You must leave your current organization first')
      return
    }

    const org = organizations?.[invite.organizationId]
    if (!org) {
      toast.error('Organization not found')
      return
    }

    if (org.subscription.usedSeats >= org.subscription.seats) {
      toast.error('Organization has reached maximum seats')
      return
    }

    setOrganizations((current) => ({
      ...(current || {}),
      [org.id]: {
        ...org,
        memberIds: [...org.memberIds, currentUser.id],
        adminIds: invite.role === 'admin' ? [...org.adminIds, currentUser.id] : org.adminIds,
        subscription: {
          ...org.subscription,
          usedSeats: org.subscription.usedSeats + 1
        }
      }
    }))

    const updatedUser = {
      ...currentUser,
      organizationId: org.id,
      organizationRole: invite.role === 'admin' ? 'admin' as const : 'member' as const
    }

    onUserUpdate(updatedUser)

    setAllUsers((current) => ({
      ...(current || {}),
      [currentUser.id]: updatedUser
    }))

    setInvites((current) =>
      (current || []).map(inv =>
        inv.id === invite.id ? { ...inv, status: 'accepted' as const } : inv
      )
    )

    toast.success(`You've joined ${org.name}! 🎉`)
  }

  const handleDeclineInvite = (invite: OrganizationInvite) => {
    setInvites((current) =>
      (current || []).map(inv =>
        inv.id === invite.id ? { ...inv, status: 'declined' as const } : inv
      )
    )
    toast.info('Invitation declined')
  }

  const handleLeaveOrganization = () => {
    if (!userOrganization) return

    const isOwner = userOrganization.createdBy === currentUser.id

    if (isOwner) {
      const otherMembers = userOrganization.memberIds.filter(id => id !== currentUser.id)
      if (otherMembers.length > 0) {
        toast.error('Transfer ownership before leaving', {
          description: 'As the owner, you must transfer ownership or remove all members first'
        })
        return
      }
    }

    setOrganizations((current) => ({
      ...(current || {}),
      [userOrganization.id]: {
        ...userOrganization,
        memberIds: userOrganization.memberIds.filter(id => id !== currentUser.id),
        adminIds: userOrganization.adminIds.filter(id => id !== currentUser.id),
        subscription: {
          ...userOrganization.subscription,
          usedSeats: Math.max(0, userOrganization.subscription.usedSeats - 1)
        }
      }
    }))

    const updatedUser = {
      ...currentUser,
      organizationId: undefined,
      organizationRole: undefined
    }

    onUserUpdate(updatedUser)

    setAllUsers((current) => ({
      ...(current || {}),
      [currentUser.id]: updatedUser
    }))

    toast.success('You have left the organization')
  }

  const handleRemoveMember = (memberId: string) => {
    if (!userOrganization) return

    const isAdmin = userOrganization.adminIds.includes(currentUser.id)
    if (!isAdmin) {
      toast.error('Only admins can remove members')
      return
    }

    const member = allUsers?.[memberId]
    if (!member) return

    setOrganizations((current) => ({
      ...(current || {}),
      [userOrganization.id]: {
        ...userOrganization,
        memberIds: userOrganization.memberIds.filter(id => id !== memberId),
        adminIds: userOrganization.adminIds.filter(id => id !== memberId),
        subscription: {
          ...userOrganization.subscription,
          usedSeats: Math.max(0, userOrganization.subscription.usedSeats - 1)
        }
      }
    }))

    setAllUsers((current) => ({
      ...(current || {}),
      [memberId]: {
        ...member,
        organizationId: undefined,
        organizationRole: undefined
      }
    }))

    toast.success(`${member.username} removed from organization`)
  }

  const getRoleIcon = (role?: 'owner' | 'admin' | 'member') => {
    switch (role) {
      case 'owner':
        return <Crown size={16} weight="fill" className="text-insider-gold" />
      case 'admin':
        return <ShieldCheck size={16} weight="fill" className="text-primary" />
      default:
        return <UserIcon size={16} />
    }
  }

  if (!userOrganization && pendingInvites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Building size={32} weight="duotone" className="text-primary" />
              <div>
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>Connect TSG to your organization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info size={18} />
              <AlertDescription>
                Organizations allow teams to collaborate, share leaderboards, and manage members with advanced features and analytics.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Create Organization</CardTitle>
                  <CardDescription>Start your own team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus size={18} weight="bold" />
                        Create Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Organization</DialogTitle>
                        <DialogDescription>
                          Set up your organization to start collaborating with your team
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="org-name">Organization Name</Label>
                          <Input
                            id="org-name"
                            placeholder="Acme Trading Co."
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="org-description">Description</Label>
                          <Textarea
                            id="org-description"
                            placeholder="What does your organization do?"
                            value={newOrgDescription}
                            onChange={(e) => setNewOrgDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateOrganization}>
                          Create Organization
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Join Organization</CardTitle>
                  <CardDescription>Accept an invitation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check your email for organization invitations
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    No Pending Invitations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (pendingInvites.length > 0 && !userOrganization) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Building size={32} weight="duotone" className="text-primary" />
              <div>
                <CardTitle>Organization Invitations</CardTitle>
                <CardDescription>You have pending invitations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInvites.map(invite => (
              <Card key={invite.id} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{invite.organizationName}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Invited by {invite.invitedByUsername}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getRoleIcon(invite.role)}
                          <span className="ml-1 capitalize">{invite.role}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptInvite(invite)}>
                        <Check size={16} weight="bold" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(invite)}>
                        <X size={16} weight="bold" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCreateDialogOpen(true)}
            >
              Or Create Your Own Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (userOrganization) {
    const isOwner = userOrganization.createdBy === currentUser.id
    const isAdmin = userOrganization.adminIds.includes(currentUser.id)
    const members = userOrganization.memberIds.map(id => allUsers?.[id]).filter(Boolean) as UserProfile[]

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building size={32} weight="duotone" className="text-primary" />
                <div>
                  <CardTitle>{userOrganization.name}</CardTitle>
                  <CardDescription>{userOrganization.description}</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                {getRoleIcon(currentUser.organizationRole)}
                <span className="capitalize">{currentUser.organizationRole}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Subscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Tier</span>
                          <Badge className="capitalize">{userOrganization.subscription.tier}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Seats</span>
                          <span className="text-sm font-medium">
                            {userOrganization.subscription.usedSeats} / {userOrganization.subscription.seats}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Organization Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Members</span>
                          <span className="text-sm font-medium">{userOrganization.memberIds.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <span className="text-sm font-medium">
                            {new Date(userOrganization.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(userOrganization.subscription.features).map(([key, enabled]) => (
                        <div key={key} className="flex items-center gap-2">
                          {enabled ? (
                            <Check size={16} weight="bold" className="text-success" />
                          ) : (
                            <X size={16} weight="bold" className="text-muted-foreground" />
                          )}
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Team Members ({members.length})</h3>
                  {(isAdmin || userOrganization.settings.allowMemberInvites) && (
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus size={16} weight="bold" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>
                            Send an invitation to join your organization
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="colleague@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          {isAdmin && (
                            <div className="space-y-2">
                              <Label htmlFor="invite-role">Role</Label>
                              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}>
                                <SelectTrigger id="invite-role">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSendInvite}>
                            Send Invitation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-2">
                  {members.map(member => {
                    const memberIsOwner = userOrganization.createdBy === member.id
                    const memberIsAdmin = userOrganization.adminIds.includes(member.id)
                    
                    return (
                      <Card key={member.id} className="border-border/50">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{member.avatar}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{member.username}</span>
                                  {memberIsOwner && getRoleIcon('owner')}
                                  {memberIsAdmin && !memberIsOwner && getRoleIcon('admin')}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {member.emailNotifications.email}
                                </span>
                              </div>
                            </div>
                            {isAdmin && member.id !== currentUser.id && !memberIsOwner && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <X size={16} />
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Alert>
                  <Info size={18} />
                  <AlertDescription>
                    Organization settings can be configured here. Contact support for advanced configuration options.
                  </AlertDescription>
                </Alert>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLeaveOrganization}
                    >
                      Leave Organization
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
