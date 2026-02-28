export type HapticFeedbackType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'

export class HapticFeedback {
  private static isSupported(): boolean {
    return 'vibrate' in navigator
  }

  static trigger(type: HapticFeedbackType = 'light'): void {
    if (!this.isSupported()) return

    const patterns: Record<HapticFeedbackType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 50,
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [50, 100, 50, 100, 50],
      selection: 5
    }

    const pattern = patterns[type]
    
    try {
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern)
      } else {
        navigator.vibrate(pattern)
      }
    } catch (error) {
      console.debug('Haptic feedback not available:', error)
    }
  }

  static portfolioSave(): void {
    this.trigger('success')
  }

  static portfolioDelete(): void {
    this.trigger('warning')
  }

  static leaderboardUpdate(): void {
    this.trigger('medium')
  }

  static groupAction(): void {
    this.trigger('light')
  }

  static achievementUnlocked(): void {
    this.trigger('success')
  }

  static errorOccurred(): void {
    this.trigger('error')
  }

  static buttonPress(): void {
    this.trigger('selection')
  }

  static tradeExecuted(): void {
    this.trigger('success')
  }

  static positionChanged(): void {
    this.trigger('medium')
  }

  static notificationReceived(): void {
    this.trigger('light')
  }

  static rankChanged(): void {
    this.trigger('heavy')
  }

  static friendAdded(): void {
    this.trigger('success')
  }

  static subscriptionUpgraded(): void {
    this.trigger('success')
  }

  static biometricAuth(): void {
    this.trigger('light')
  }

  static settingChanged(): void {
    this.trigger('selection')
  }
}
