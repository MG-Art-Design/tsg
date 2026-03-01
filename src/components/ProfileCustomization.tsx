import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserProfile } from '@/lib/types'
import { User, ShareNetwork, ChatCircleText, Copy, Shuffle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getReversedAvatar } from '@/lib/helpers'

interface ProfileCustomizationProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

const AVATAR_OPTIONS = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦈', '🐉', '🦖', '🦏', '🐘', '🦒', '🦌', '🐎', '🦓', '🦍', '🐆', '🐅', '🦘', '🦙', '🐪', '🦫', '🦦', '🦨', '🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺', '🎻', '🎹', '🚀', '✈️', '🚁', '🛸', '⚡', '🔥', '💎', '👑', '🏆', '⭐', '🌟', '💫', '🌈', '🌊', '🌋', '🗻']

export function ProfileCustomization({ profile, onUpdate }: ProfileCustomizationProps) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [bioDialogOpen, setBioDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar)
  const [bioText, setBioText] = useState(profile.bio || '')
  const [showSassyMessage, setShowSassyMessage] = useState(false)
  const [sassyMessage, setSassyMessage] = useState('')

  const handleAvatarSave = () => {
    const updatedProfile = { 
      ...profile, 
      avatar: selectedAvatar,
      originalAvatar: profile.originalAvatar || profile.avatar
    }
    onUpdate(updatedProfile)
    setAvatarDialogOpen(false)
    toast.success('Avatar updated!')
  }

  const handleReverseAvatar = () => {
    const reversed = getReversedAvatar(profile.email)
    const updatedProfile = {
      ...profile,
      avatar: reversed.emoji,
      originalAvatar: profile.originalAvatar || profile.avatar
    }
    onUpdate(updatedProfile)
    setSassyMessage(reversed.message)
    setShowSassyMessage(true)
    
    setTimeout(() => {
      setShowSassyMessage(false)
    }, 5000)
  }

  useEffect(() => {
    if (profile.avatar && !profile.originalAvatar) {
      onUpdate({ ...profile, originalAvatar: profile.avatar })
    }
  }, [])

  const handleBioSave = () => {
    onUpdate({ ...profile, bio: bioText.trim() })
    setBioDialogOpen(false)
    toast.success('Bio updated!')
  }

  const shareViaMessaging = (platform: 'imessage' | 'signal') => {
    const shareMessage = `Join me on TSG: The Stonk Game! Use my friend code: ${profile.friendCode}`
    
    if (platform === 'imessage') {
      window.open(`sms:&body=${encodeURIComponent(shareMessage)}`, '_blank')
      toast.success('Opening Messages app...')
    } else if (platform === 'signal') {
      navigator.clipboard.writeText(shareMessage)
      window.open('https://signal.org/download/', '_blank')
      toast.success('Message copied! Opening Signal...')
    }
    setShareDialogOpen(false)
  }

  const copyFriendCode = () => {
    navigator.clipboard.writeText(profile.friendCode)
    toast.success('Friend code copied to clipboard!')
  }

  return (
    <Card className="border-2 border-[oklch(0.70_0.14_75)] bg-gradient-to-br from-card to-[oklch(0.08_0.006_70)] shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={24} weight="bold" />
          Profile Customization
        </CardTitle>
        <CardDescription>
          Personalize your profile with custom avatar and bio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            className="relative w-48 h-48 aspect-square rounded-lg bg-gradient-to-br from-[oklch(0.19_0.015_240)] to-[oklch(0.10_0.005_60)] border-2 border-[oklch(0.70_0.14_75)] flex items-center justify-center cursor-pointer shadow-[0_0_30px_oklch(0.65_0.12_75_/_0.3)] overflow-hidden group"
            onClick={() => setAvatarDialogOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[oklch(0.70_0.14_75_/_0.2)] to-transparent"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center"
            >
              <div className="text-white text-center">
                <User size={32} weight="bold" />
                <p className="text-sm mt-2">Change Avatar</p>
              </div>
            </motion.div>

            <span className="relative z-10 text-8xl">{profile.avatar}</span>
          </motion.div>

          <Button
            onClick={handleReverseAvatar}
            variant="outline"
            className="border-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)] text-[oklch(0.70_0.14_75)]"
          >
            <Shuffle size={18} weight="bold" className="mr-2" />
            Reverse Avatar Logic
          </Button>

          <AnimatePresence>
            {showSassyMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-[oklch(0.19_0.015_240)] to-[oklch(0.10_0.005_60)] border-2 border-[oklch(0.70_0.14_75)] rounded-lg p-4 shadow-[0_0_30px_oklch(0.65_0.12_75_/_0.3)]"
              >
                <p className="text-[oklch(0.70_0.14_75)] text-center font-medium">
                  {sassyMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="w-full max-w-md space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <motion.h3 
                className="text-2xl font-bold"
                animate={{
                  textShadow: [
                    '0 0 10px oklch(0.70 0.14 75 / 0)',
                    '0 0 10px oklch(0.70 0.14 75 / 0.3)',
                    '0 0 10px oklch(0.70 0.14 75 / 0)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {profile.username}
              </motion.h3>
            </div>

            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-[oklch(0.19_0.015_240)] to-[oklch(0.10_0.005_60)] border-2 border-[oklch(0.70_0.14_75)] p-6 flex items-center justify-center shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
              {profile.bio ? (
                <p className="text-center text-muted-foreground break-words">{profile.bio}</p>
              ) : (
                <p className="text-center text-muted-foreground/50 italic">No bio yet</p>
              )}
            </div>

            <Dialog open={bioDialogOpen} onOpenChange={setBioDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                  onClick={() => setBioText(profile.bio || '')}
                >
                  Edit Bio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
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
                      rows={6}
                      maxLength={200}
                      className="resize-none"
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

            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-[oklch(0.19_0.015_240)] to-[oklch(0.10_0.005_60)] border-2 border-[oklch(0.70_0.14_75)] p-6 flex flex-col items-center justify-center gap-4 shadow-[0_0_20px_oklch(0.65_0.12_75_/_0.2)]">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Friend Code</p>
                <p className="text-2xl font-bold text-[oklch(0.70_0.14_75)]">{profile.friendCode}</p>
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyFriendCode}
                  className="w-full border-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                >
                  <Copy size={16} weight="bold" className="mr-2" />
                  Copy Code
                </Button>
                
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                    >
                      <ShareNetwork size={16} weight="bold" className="mr-2" />
                      Share via Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ShareNetwork size={24} weight="bold" />
                        Share Friend Code
                      </DialogTitle>
                      <DialogDescription>
                        Choose how you'd like to share your friend code
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Button
                        onClick={() => shareViaMessaging('imessage')}
                        className="w-full bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] hover:from-[oklch(0.70_0.14_75)] hover:to-[oklch(0.75_0.14_75)]"
                      >
                        <ChatCircleText size={20} weight="bold" className="mr-2" />
                        Share via iMessage
                      </Button>
                      
                      <Button
                        onClick={() => shareViaMessaging('signal')}
                        className="w-full bg-gradient-to-r from-[oklch(0.45_0.15_240)] to-[oklch(0.50_0.18_220)] hover:from-[oklch(0.50_0.18_220)] hover:to-[oklch(0.55_0.20_240)]"
                      >
                        <ChatCircleText size={20} weight="bold" className="mr-2" />
                        Share via Signal
                      </Button>
                      
                      <Button
                        onClick={copyFriendCode}
                        variant="outline"
                        className="w-full border-[oklch(0.70_0.14_75)] hover:bg-[oklch(0.65_0.12_75_/_0.15)]"
                      >
                        <Copy size={20} weight="bold" className="mr-2" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        </div>

        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Choose Your Avatar</DialogTitle>
              <DialogDescription>
                Select an emoji that represents your trading spirit
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {AVATAR_OPTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-4xl p-3 rounded-lg transition-all ${
                    selectedAvatar === emoji
                      ? 'bg-[oklch(0.65_0.12_75_/_0.3)] border-2 border-[oklch(0.70_0.14_75)] scale-110'
                      : 'bg-muted border-2 border-transparent hover:border-[oklch(0.70_0.14_75_/_0.5)]'
                  }`}
                  whileHover={{ scale: selectedAvatar === emoji ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <Button 
              onClick={handleAvatarSave} 
              className="w-full bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.70_0.14_75)] hover:from-[oklch(0.70_0.14_75)] hover:to-[oklch(0.75_0.14_75)]"
            >
              Save Avatar
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
