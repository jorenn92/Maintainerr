import { useRef, useState } from 'react'
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import Image from 'next/image'

const Login = () => {
  const usernameRef = useRef<HTMLInputElement>(null) // ✅ Use useRef for username
  const passwordRef = useRef<HTMLInputElement>(null) // ✅ Use useRef for password
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isProcessing, setProcessing] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProcessing(true)
    setError('')

    // ✅ Fetch values directly from refs instead of state
    const username = usernameRef.current?.value.trim()
    const password = passwordRef.current?.value

    if (!username || !password) {
      setError('Username and password are required')
      setProcessing(false)
      return
    }

    try {
      const response = await fetch('/api/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid username or password')
      }

      router.push('/') // Redirect on success
    } catch (error) {
      setError(error.message)
      setProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url(/login_bg.png)] bg-cover bg-center bg-no-repeat px-4">
      <div className="absolute left-0 top-0 h-full w-full bg-black bg-opacity-60"></div>
      <div className="z-40 w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={50}
          height={50}
          className="mx-auto mb-4 h-auto max-h-[140px] w-auto max-w-[65%] md:max-h-[200px] md:max-w-[65%]"
        />
        {error && (
          <div className="text-md mt-4 rounded bg-red-600 p-3 text-center text-black">
            {error}
          </div>
        )}
        <form className="mt-4" onSubmit={handleSubmit}>
          {/* ✅ Username Field (Ref) */}
          <div className="mb-4">
            <label className="block text-gray-400">Username</label>
            <input
              type="text"
              ref={usernameRef} // ✅ Using ref instead of state
              className="form-input-field border-none focus:outline-none focus:ring-2 focus:ring-amber-600"
              autoComplete="username"
              required
            />
          </div>

          {/* ✅ Password Field (Ref) */}
          <div className="relative mb-4">
            <label className="block text-gray-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                ref={passwordRef} // ✅ Using ref instead of state
                className="form-input-field border-none focus:ring-2 focus:ring-amber-600"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-amber-600 py-2 text-white hover:bg-amber-500 disabled:bg-gray-700"
            disabled={isProcessing}
          >
            {isProcessing ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
