export interface BiometricSupport {
  available: boolean
  type: 'fingerprint' | 'face' | 'unknown'
}

export async function checkBiometricSupport(): Promise<BiometricSupport> {
  if (!window.PublicKeyCredential) {
    return { available: false, type: 'unknown' }
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    
    if (!available) {
      return { available: false, type: 'unknown' }
    }

    const ua = navigator.userAgent.toLowerCase()
    let type: 'fingerprint' | 'face' | 'unknown' = 'unknown'
    
    if (ua.includes('iphone') || ua.includes('ipad')) {
      type = 'face'
    } else if (ua.includes('android')) {
      type = 'fingerprint'
    } else if (ua.includes('mac')) {
      type = 'fingerprint'
    }

    return { available: true, type }
  } catch (error) {
    return { available: false, type: 'unknown' }
  }
}

export async function registerBiometric(userId: string, email: string): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'TSG: The Stonk Game',
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: email,
        displayName: email
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none'
    }

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    }) as PublicKeyCredential

    if (!credential) {
      return false
    }

    await window.spark.kv.set(`biometric:${userId}`, {
      credentialId: Array.from(new Uint8Array(credential.rawId)),
      publicKey: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).getPublicKey()!)),
      email,
      registeredAt: Date.now()
    })

    await window.spark.kv.set(`biometric:enabled:${userId}`, true)

    return true
  } catch (error) {
    console.error('Biometric registration failed:', error)
    return false
  }
}

export async function authenticateWithBiometric(userId: string): Promise<boolean> {
  try {
    const storedCredential = await window.spark.kv.get<{
      credentialId: number[]
      publicKey: number[]
      email: string
      registeredAt: number
    }>(`biometric:${userId}`)

    if (!storedCredential) {
      return false
    }

    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: new Uint8Array(storedCredential.credentialId),
        type: 'public-key',
        transports: ['internal']
      }],
      userVerification: 'required',
      timeout: 60000
    }

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    }) as PublicKeyCredential

    if (!assertion) {
      return false
    }

    return true
  } catch (error) {
    console.error('Biometric authentication failed:', error)
    return false
  }
}

export async function isBiometricEnabled(userId: string): Promise<boolean> {
  const enabled = await window.spark.kv.get<boolean>(`biometric:enabled:${userId}`)
  return enabled === true
}

export async function disableBiometric(userId: string): Promise<void> {
  await window.spark.kv.delete(`biometric:${userId}`)
  await window.spark.kv.delete(`biometric:enabled:${userId}`)
}

export async function getBiometricUsers(): Promise<Array<{ userId: string; email: string }>> {
  const keys = await window.spark.kv.keys()
  const biometricKeys = keys.filter(key => key.startsWith('biometric:') && !key.includes(':enabled:'))
  
  const users = await Promise.all(
    biometricKeys.map(async (key) => {
      const userId = key.replace('biometric:', '')
      const data = await window.spark.kv.get<{ email: string }>(key)
      return data ? { userId, email: data.email } : null
    })
  )

  return users.filter((u): u is { userId: string; email: string } => u !== null)
}
