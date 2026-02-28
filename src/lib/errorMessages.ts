export const ErrorMessages = {
  auth: {
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    emailAlreadyRegistered: 'This email is already registered. Try logging in instead.',
    userNotFound: 'Incorrect email or password',
    biometricFailed: 'Biometric authentication failed. Please try again or use your password.',
    biometricUnavailable: 'Biometric authentication is not available on this device',
  },
  portfolio: {
    invalidAllocation: 'Total allocation must equal 100%',
    noPositions: 'Add at least one position to your portfolio',
    allocationOutOfRange: 'Allocation must be between 0% and 100%',
    tooManyPortfolios: 'Free users can create up to 3 portfolios. Upgrade to Premium for unlimited portfolios.',
  },
  group: {
    nameRequired: 'Group name is required',
    invalidInviteCode: 'Invalid invite code. Please check and try again.',
    alreadyMember: 'You\'re already a member of this group',
    notGroupOwner: 'Only the group owner can perform this action',
  },
  betting: {
    noPaymentAccounts: 'Please add a payment account to receive payouts',
    insufficientBalance: 'Insufficient virtual balance for this bet',
    bettingLocked: 'Betting is locked once the game has started',
  },
  insider: {
    generationFailed: 'Failed to generate insights. Please try again in a moment.',
    noTradesAvailable: 'Not enough trading data available for analysis',
    rateLimitExceeded: 'Too many requests. Please wait a moment before trying again.',
  },
  premium: {
    featureLocked: 'This is a premium feature. Upgrade to access.',
    linkedAccountRequired: 'This feature requires a linked trading account',
  },
  general: {
    networkError: 'Network error. Please check your connection and try again.',
    unknownError: 'Something went wrong. Please try again.',
    saveFailed: 'Failed to save changes. Please try again.',
    loadFailed: 'Failed to load data. Please refresh the page.',
  }
} as const

export const SuccessMessages = {
  auth: {
    accountCreated: 'Account created successfully! Welcome to TSG.',
    signInSuccess: 'Welcome back!',
    signOutSuccess: 'Signed out successfully',
    biometricEnabled: 'Biometric authentication enabled',
  },
  portfolio: {
    created: 'Portfolio created! Time to watch those gains roll in.',
    updated: 'Portfolio updated! Your positions are locked in.',
    deleted: 'Portfolio deleted',
    renamed: 'Portfolio renamed successfully',
  },
  group: {
    created: 'Group created! Share your invite code with friends.',
    joined: 'You\'ve joined the group! Get ready to compete.',
    left: 'You\'ve left the group',
  },
  betting: {
    payoutSent: 'Payout notification sent to all members',
    paymentAdded: 'Payment account added successfully',
    betPlaced: 'Bet placed! Good luck.',
  },
  insider: {
    insightGenerated: 'Strategic insight generated! Time to make some moves.',
    recommendationsGenerated: 'Daily recommendations ready! Check them out.',
  },
  general: {
    saved: 'Changes saved successfully',
    copied: 'Copied to clipboard',
  }
} as const
