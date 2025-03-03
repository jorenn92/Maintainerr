import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  authEnabled: boolean | null
  isAuthenticated: boolean | null
  refreshAuthStatus: () => void
}

const AuthContext = createContext<AuthContextType>({
  authEnabled: null,
  isAuthenticated: null,
  refreshAuthStatus: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authEnabled, setAuthEnabled] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const fetchAuthStatus = async () => {
    try {
      const statusRes = await fetch('/api/authentication/status', {
        credentials: 'include',
      })
      const authEnabledHeader = statusRes.headers.get('X-Auth-Enabled')
      const authEnabled = authEnabledHeader === 'true'
      setAuthEnabled(authEnabled)

      const statusData = await statusRes.json()
      setIsAuthenticated(statusData.isAuthenticated)
    } catch (error) {
      console.error('Failed to fetch authentication status:', error)
      setAuthEnabled(false)
      setIsAuthenticated(false)
    }
  }
  useEffect(() => {
    fetchAuthStatus()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authEnabled,
        isAuthenticated,
        refreshAuthStatus: fetchAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
