import type { NextPage } from 'next'
import Router, { useRouter } from 'next/router'
import { useEffect } from 'react'
import Layout from '../components/Layout'

const Home: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/rules')
  }, [])
  
  return <></>
}

export default Home
