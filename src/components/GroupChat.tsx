import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChatMessage, UserProfile } from '@/lib/types'
import { cleanupOldMessages, formatMessageTime } from '@/lib/helpers'
import { PaperPlaneRight, Smiley } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GroupChatProps {
  groupId: string
  groupName: string
  currentUser: UserProfile
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '🚀', '💰', '📈', '📉', '💎']

export function GroupChat({ groupId, groupName, currentUser }: GroupChatProps) {
  const [messages, setMessages] = useKV<ChatMessage[]>(`group-chat-${groupId}`, [])
  const [messageInput, setMessageInput] = useState('')
  const [reactionPopover, setReactionPopover] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages && messages.length > 0) {
      const cleaned = cleanupOldMessages(messages)
      if (cleaned.length !== messages.length) {
        setMessages(cleaned)
      }
    }
  }, [messages?.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages?.length])

  const handleSendMessage = () => {
    const content = messageInput.trim()
    if (!content) return

    if (content.length > 500) {
      toast.error('Message too long', {
        description: 'Keep it under 500 characters'
      })
      return
    }

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${currentUser.id}`,
      groupId,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      content,
      timestamp: Date.now(),
      reactions: []
    }

    setMessages(current => [...(current || []), newMessage])
    setMessageInput('')
  }

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(current => 
      (current || []).map(msg => {
        if (msg.id !== messageId) return msg

        const existingReaction = msg.reactions.find(
          r => r.emoji === emoji && r.userId === currentUser.id
        )

        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.filter(
              r => !(r.emoji === emoji && r.userId === currentUser.id)
            )
          }
        }

        return {
          ...msg,
          reactions: [
            ...msg.reactions,
            {
              emoji,
              userId: currentUser.id,
              username: currentUser.username,
              timestamp: Date.now()
            }
          ]
        }
      })
    )
    setReactionPopover(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const groupedReactions = (reactions: ChatMessage['reactions']) => {
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction)
      return acc
    }, {} as Record<string, ChatMessage['reactions']>)

    return Object.entries(grouped).map(([emoji, reactionList]) => ({
      emoji,
      count: reactionList.length,
      usernames: reactionList.map(r => r.username),
      hasCurrentUser: reactionList.some(r => r.userId === currentUser.id)
    }))
  }

  const sortedMessages = [...(messages || [])].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">{groupName} Chat</CardTitle>
        <p className="text-sm text-muted-foreground">
          Messages are stored for 3 months
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {sortedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">Be the first to break the ice!</p>
              </div>
            ) : (
              sortedMessages.map((message, index) => {
                const isCurrentUser = message.userId === currentUser.id
                const showAvatar = index === 0 || sortedMessages[index - 1].userId !== message.userId
                const grouped = groupedReactions(message.reactions)

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="w-8 shrink-0">
                      {showAvatar && (
                        <div className="text-2xl">{message.avatar}</div>
                      )}
                    </div>
                    <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {showAvatar && (
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-sm font-semibold">{message.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className="relative group">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <Popover open={reactionPopover === message.id} onOpenChange={(open) => setReactionPopover(open ? message.id : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-6 w-6 absolute -bottom-2 ${isCurrentUser ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}
                            >
                              <Smiley size={14} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2">
                            <div className="flex gap-1">
                              {EMOJI_REACTIONS.map(emoji => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {grouped.length > 0 && (
                        <div className="flex gap-1 flex-wrap px-1">
                          {grouped.map(({ emoji, count, usernames, hasCurrentUser }) => (
                            <TooltipProvider key={emoji}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 px-2 text-xs gap-1 ${
                                      hasCurrentUser ? 'bg-accent/50' : ''
                                    }`}
                                    onClick={() => handleAddReaction(message.id, emoji)}
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-[10px]">{count}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{usernames.join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              id="message-input"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={500}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="gap-2"
            >
              <PaperPlaneRight size={18} weight="fill" />
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {messageInput.length}/500
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
