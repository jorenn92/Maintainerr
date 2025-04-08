import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../../styles/globals.css'
import Layout from '../components/Layout'
import { LibrariesContextProvider } from '../contexts/libraries-context'
import { SearchContextProvider } from '../contexts/search-context'
import { SettingsContextProvider } from '../contexts/settings-context'

function CoreApp({ Component, pageProps }: AppProps) {
  return (
    <SettingsContextProvider>
      <SearchContextProvider>
        <LibrariesContextProvider>
          <ToastContainer
            stacked
            position="top-right"
            autoClose={4500}
            hideProgressBar={false}
            theme="dark"
            closeOnClick
          />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LibrariesContextProvider>
      </SearchContextProvider>
    </SettingsContextProvider>
  )
}

export default CoreApp
