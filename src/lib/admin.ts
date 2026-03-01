export const ADMIN_USERNAME = 'MG2026fuckya'
export const ADMIN_PASSWORD = 'Administerdeeznutz!'

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function isAdminSession(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('admin-mode') === 'true'
}

export function setAdminSession(isAdmin: boolean): void {
  if (typeof window === 'undefined') return
  if (isAdmin) {
    sessionStorage.setItem('admin-mode', 'true')
  } else {
    sessionStorage.removeItem('admin-mode')
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('admin-mode')
}
