import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserProfile } from '@/lib/types'
import { Camera, User, Palette } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ProfileCustomizationProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

const AVATAR_OPTIONS = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓', '🦍', '🐆', '🐅', '🦘', '🦙', '🐪', '🦫', '🦦', '🦨']

const COVER_PHOTO_GRADIENTS = [
  'linear-gradient(135deg, oklch(0.45 0.15 240) 0%, oklch(0.30 0.12 280) 100%)',
  'linear-gradient(135deg, oklch(0.50 0.18 30) 0%, oklch(0.35 0.15 350) 100%)',
  'linear-gradient(135deg, oklch(0.42 0.14 140) 0%, oklch(0.28 0.12 180) 100%)',
  'linear-gradient(135deg, oklch(0.48 0.16 75) 0%, oklch(0.32 0.14 45) 100%)',
  'linear-gradient(135deg, oklch(0.40 0.13 300) 0%, oklch(0.25 0.10 260) 100%)',
  'linear-gradient(135deg, oklch(0.55 0.12 190) 0%, oklch(0.38 0.10 210) 100%)',
  'linear-gradient(135deg, oklch(0.22 0.05 240) 0%, oklch(0.12 0.02 260) 100%)',
  'linear-gradient(135deg, oklch(0.35 0.08 15) 0%, oklch(0.18 0.04 340) 100%)',
  'linear-gradient(135deg, oklch(0.65 0.20 50) 0%, oklch(0.45 0.16 80) 100%)',
  'linear-gradient(135deg, oklch(0.38 0.11 160) 0%, oklch(0.22 0.08 200) 100%)',
  'linear-gradient(135deg, oklch(0.70 0.14 75) 0%, oklch(0.15 0.01 240) 100%)',
  'linear-gradient(135deg, oklch(0.28 0.06 280) 0%, oklch(0.15 0.03 240) 100%)',
]

export function ProfileCustomization({ profile, onUpdate }: ProfileCustomizationProps) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [coverDialogOpen, setCoverDialogOpen] = useState(false)
  const [bioDialogOpen, setBioDialogOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar)
  const [selectedCover, setSelectedCover] = useState(profile.coverPhoto || COVER_PHOTO_GRADIENTS[0])
  const [bioText, setBioText] = useState(profile.bio || '')

  const handleAvatarSave = () => {
    onUpdate({ ...profile, avatar: selectedAvatar })
    setAvatarDialogOpen(false)
    toast.success('Avatar updated!')
  }

  const handleCoverSave = () => {
    onUpdate({ ...profile, coverPhoto: selectedCover })
    setCoverDialogOpen(false)
    toast.success('Cover photo updated!')
  }

  const handleBioSave = () => {
    onUpdate({ ...profile, bio: bioText.trim() })
    setBioDialogOpen(false)
    toast.success('Bio updated!')
  }

  return (
    <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.08_0.006_70)] shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={24} weight="bold" />
          Profile Customization
        </CardTitle>
        <CardDescription>
          Personalize your profile with custom avatar and cover photo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
          className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer group"
          style={{ background: profile.coverPhoto || COVER_PHOTO_GRADIENTS[0] }}
          onClick={() => setCoverDialogOpen(true)}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Camera size={32} weight="bold" />
              <p className="text-sm mt-2">Change Cover Photo</p>
            </div>
          </div>
          <div className="absolute -bottom-8 left-6">
            <div className="w-20 h-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-4xl cursor-pointer hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation()
                setAvatarDialogOpen(true)
              }}
            >
              {profile.avatar}
            </div>
          </div>
        </div>

        <div className="pt-10 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{profile.username}</h3>
              <p className="text-muted-foreground text-sm">Friend Code: {profile.friendCode}</p>
            </div>
            <Dialog open={bioDialogOpen} onOpenChange={setBioDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setBioText(profile.bio || '')}>
                  Edit Bio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Bio</DialogTitle>
                  <DialogDescription>
                    Tell your friends and rivals what you're about
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Master of the markets..."
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {bioText.length}/200 characters
                    </p>
                  </div>
                  <Button onClick={handleBioSave} className="w-full">
                    Save Bio
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
        </div>

        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Choose Your Avatar</DialogTitle>
              <DialogDescription>
                Select an emoji that represents your trading spirit
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-4xl p-3 rounded-lg transition-all hover:scale-110 ${
                    selectedAvatar === emoji
                      ? 'bg-primary/20 border-2 border-primary scale-110'
                      : 'bg-muted border-2 border-transparent'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <Button onClick={handleAvatarSave} className="w-full">
              Save Avatar
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette size={24} weight="bold" />
                Choose Cover Photo
              </DialogTitle>
              <DialogDescription>
                Select a gradient background for your profile
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              {COVER_PHOTO_GRADIENTS.map((gradient, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCover(gradient)}
                  className={`h-24 rounded-lg transition-all hover:scale-105 ${
                    selectedCover === gradient
                      ? 'ring-4 ring-primary scale-105'
                      : 'ring-2 ring-border'
                  }`}
                  style={{ background: gradient }}
                />
              ))}
            </div>
            <Button onClick={handleCoverSave} className="w-full">
              Save Cover Photo
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
