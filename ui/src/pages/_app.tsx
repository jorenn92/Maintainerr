import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { LibrariesContextProvider } from '../contexts/libraries-context'
import { SettingsContextProvider } from '../contexts/settings-context'
import { SearchContextProvider } from '../contexts/search-context'
import { ToastProvider } from 'react-toast-notifications'

function CoreApp({ Component, pageProps }: AppProps) {
  return (
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
  )
}

export default CoreApp
