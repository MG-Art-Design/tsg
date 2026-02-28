import { useEffect } from 'react'

export type ShortcutKey = 
  | 'dashboard'
  | 'portfolios'
  | 'edit'
  | 'compare'
  | 'leaderboard'
  | 'groups'
  | 'insights'
  | 'profile'
  | 'save'
  | 'refresh'
  | 'search'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
}

export const shortcuts: Record<ShortcutKey, KeyboardShortcut> = {
  dashboard: { key: 'd', alt: true, description: 'Go to Dashboard' },
  portfolios: { key: 'p', alt: true, description: 'Go to Portfolios' },
  edit: { key: 'e', alt: true, description: 'Edit Portfolio' },
  compare: { key: 'c', alt: true, description: 'Compare Portfolios' },
  leaderboard: { key: 'l', alt: true, description: 'Go to Leaderboard' },
  groups: { key: 'g', alt: true, description: 'Go to Groups' },
  insights: { key: 'i', alt: true, description: 'Go to Insights' },
  profile: { key: 'u', alt: true, description: 'Go to Profile (User)' },
  save: { key: 's', ctrl: true, description: 'Save Changes' },
  refresh: { key: 'r', ctrl: true, shift: true, description: 'Refresh Data' },
  search: { key: '/', description: 'Focus Search' },
}

export function useKeyboardShortcut(
  shortcutKey: ShortcutKey,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const shortcut = shortcuts[shortcutKey]
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
      const matchesCtrl = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
      const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey
      const matchesAlt = shortcut.alt ? e.altKey : !e.altKey
      
      const isInputFocused = 
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.hasAttribute('contenteditable')
      
      if (shortcutKey !== 'search' && isInputFocused) {
        return
      }
      
      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        e.preventDefault()
        callback()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcutKey, callback, enabled])
}

export function getShortcutDisplay(shortcutKey: ShortcutKey): string {
  const shortcut = shortcuts[shortcutKey]
  const keys: string[] = []
  
  if (shortcut.ctrl) keys.push('⌘')
  if (shortcut.shift) keys.push('⇧')
  if (shortcut.alt) keys.push('⌥')
  keys.push(shortcut.key.toUpperCase())
  
  return keys.join('+')
}
