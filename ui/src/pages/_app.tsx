import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { LibrariesContextProvider } from '../contexts/libraries-context'
import { SettingsContextProvider } from '../contexts/settings-context'
import { SearchContextProvider } from '../contexts/search-context'
import { ToastProvider } from 'react-toast-notifications'
import { AuthProvider, useAuth } from '../contexts/auth-context'

interface authProps extends AppProps {
  pageProps: {
    authEnabled: boolean
  }
}

function CoreApp({ Component, pageProps }: authProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { authEnabled } = pageProps // ✅ Auth setting comes from page props

  useEffect(() => {
    const checkAuth = async () => {
      if (!authEnabled) {
        // ✅ Skip auth check if auth is disabled
        setIsAuthenticated(true)
        setIsCheckingAuth(false)
        return
      }

      try {
        const res = await fetch('/api/authentication/status', {
          credentials: 'include',
        })
        const data = await res.json()

        setIsAuthenticated(data.isAuthenticated)

        // Redirect if necessary
        if (!data.isAuthenticated && router.pathname !== '/login') {
          router.replace('/login')
        } else if (data.isAuthenticated && router.pathname === '/login') {
          router.replace('/')
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router.pathname, authEnabled])

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    )
  }

  // ✅ Prevent sidebar layout for login page
  const isLoginPage = router.pathname.startsWith('/login')

  return isLoginPage ? (
    <Component {...pageProps} />
  ) : (
    <AuthProvider>
      <SettingsContextProvider>
        <SearchContextProvider>
          <Layout>
            <LibrariesContextProvider>
              <ToastProvider>
                <Component {...pageProps} />
              </ToastProvider>
            </LibrariesContextProvider>
          </Layout>
        </SearchContextProvider>
      </SettingsContextProvider>
    </AuthProvider>
  )
}

export default CoreApp
