import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { LibrariesContextProvider } from '../contexts/libraries-context'
import { SettingsContextProvider } from '../contexts/settings-context'
import { SearchContextProvider } from '../contexts/search-context'
import { ToastProvider } from 'react-toast-notifications'
import { AuthProvider } from '../contexts/auth-context'

function CoreApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

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
