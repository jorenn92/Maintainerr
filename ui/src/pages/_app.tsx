import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import axios from 'axios'

axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
function CoreApp({ Component, pageProps }: AppProps) {
  return <Layout><Component {...pageProps} /></Layout>
}

export default CoreApp
