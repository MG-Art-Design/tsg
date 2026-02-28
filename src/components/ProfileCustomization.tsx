import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserProfile } from '@/lib/types'
import { Camera, User, Palette } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, useScroll, useTransform } from 'framer-motion'

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const bannerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setMousePosition({ x, y })
      }
    }

    const banner = bannerRef.current
    if (banner) {
      banner.addEventListener('mousemove', handleMouseMove)
      return () => banner.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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
        <motion.div 
          ref={bannerRef}
          className="relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setCoverDialogOpen(true)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ 
              background: profile.coverPhoto || COVER_PHOTO_GRADIENTS[0],
              y,
              scale
            }}
          />
          
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, oklch(0.75 0.15 75 / 0.15) 0%, transparent 50%)`
            }}
          />

          <motion.div
            className="absolute top-4 left-4 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, oklch(0.70 0.14 75 / 0.2) 0%, transparent 70%)',
              x: useTransform(scrollYProgress, [0, 1], [0, 50]),
              y: useTransform(scrollYProgress, [0, 1], [0, 30]),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.div
            className="absolute bottom-6 right-8 w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, oklch(0.65 0.12 75 / 0.25) 0%, transparent 70%)',
              x: useTransform(scrollYProgress, [0, 1], [0, -30]),
              y: useTransform(scrollYProgress, [0, 1], [0, 20]),
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle, oklch(0.70 0.14 75 / 0.15) 0%, transparent 70%)',
              x: useTransform(scrollYProgress, [0, 1], [-100, -50]),
              y: useTransform(scrollYProgress, [0, 1], [-100, -50]),
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <motion.div 
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ opacity }}
          >
            <motion.div 
              className="text-white text-center"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Camera size={32} weight="bold" />
              <p className="text-sm mt-2">Change Cover Photo</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="absolute -bottom-12 left-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center text-5xl cursor-pointer shadow-lg relative overflow-hidden"
              onClick={(e) => {
                e.stopPropagation()
                setAvatarDialogOpen(true)
              }}
              animate={{
                boxShadow: [
                  '0 0 20px oklch(0.70 0.14 75 / 0.3)',
                  '0 0 30px oklch(0.70 0.14 75 / 0.5)',
                  '0 0 20px oklch(0.70 0.14 75 / 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[oklch(0.70_0.14_75_/_0.2)] to-transparent"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative z-10">{profile.avatar}</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="pt-16 space-y-4">
          <motion.div 
            className="flex justify-between items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <motion.h3 
                className="text-xl font-bold"
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
          </motion.div>
          {profile.bio && (
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {profile.bio}
            </motion.p>
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
                <motion.button
                  key={index}
                  onClick={() => setSelectedCover(gradient)}
                  className={`h-24 rounded-lg transition-all relative overflow-hidden ${
                    selectedCover === gradient
                      ? 'ring-4 ring-primary scale-105'
                      : 'ring-2 ring-border'
                  }`}
                  style={{ background: gradient }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, oklch(1 0 0 / 0.2) 0%, transparent 60%)'
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.1
                    }}
                  />
                </motion.button>
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
