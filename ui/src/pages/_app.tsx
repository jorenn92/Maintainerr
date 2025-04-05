import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import '../../styles/globals.css'
import Layout from '../components/Layout'
import { LibrariesContextProvider } from '../contexts/libraries-context'
import { SearchContextProvider } from '../contexts/search-context'
import { SettingsContextProvider } from '../contexts/settings-context'

function CoreApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <EventsProvider>
        <TaskStatusProvider>
          <SettingsContextProvider>
            <SearchContextProvider>
              <Layout>
                <LibrariesContextProvider>
                  <ToastContainer
                    stacked
                    position="top-right"
                    autoClose={4500}
                    hideProgressBar={false}
                    theme="dark"
                    closeOnClick
                  />
                  <Component {...pageProps} />
                </LibrariesContextProvider>
              </Layout>
            </SearchContextProvider>
          </SettingsContextProvider>
        </TaskStatusProvider>
      </EventsProvider>
    </QueryClientProvider>
  )
}

export default CoreApp
