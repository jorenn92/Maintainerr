export const clearAuthSession = async (redirectToLogin = false) => {
  try {
    await fetch('/api/authentication/logout', {
      method: 'POST',
      credentials: 'include',
    })

    localStorage.removeItem('isAuthenticated')

    document.cookie =
      'sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict'

    if (redirectToLogin) {
      window.location.href = '/login' // ✅ Redirect to login only if auth is enabled
    }
  } catch (error) {
    console.error('Failed to clear authentication session:', error)
  }
}
