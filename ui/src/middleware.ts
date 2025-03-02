import { NextResponse, NextRequest } from 'next/server'

const apiPort = process.env.API_PORT || 3001

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const baseUrl = request.nextUrl.origin
  let authEnabled = false

  // ✅ Allow the login page to load freely
  if (
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|css|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // ✅ Check if this is an API request and rewrite it
  if (url.pathname.startsWith('/api/')) {
    const destination = `http://localhost:${apiPort}${url.pathname}`
    return NextResponse.rewrite(destination)
  }

  try {
    // ✅ Fetch authentication status
    const authRes = await fetch(
      `http://localhost:${apiPort}/api/authentication/status`,
      {
        credentials: 'include',
      },
    )
    const authEnabled = authRes.headers.get('X-Auth-Enabled') === 'true'
    if (!authEnabled) {
      return NextResponse.next()
    }
  } catch (error) {
    authEnabled = false
  }

  const sessionToken = request.cookies.get('sessionToken')?.value || null

  if (!sessionToken) {
    const refreshToken = request.cookies.get('refreshToken')?.value || null

    if (refreshToken) {
      try {
        const refreshRes = await fetch(
          `http://localhost:${apiPort}/api/authentication/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              Cookie: `refreshToken=${refreshToken}`,
            },
          },
        )
        const updatedCookies = await refreshRes.json()

        if (
          refreshRes.ok &&
          updatedCookies.success &&
          updatedCookies.sessionToken
        ) {
          const response = NextResponse.next()
          response.cookies.set('sessionToken', updatedCookies.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60, // 1 hour in seconds
          })
          return response
        } else {
          console.warn('Middleware - Token refresh failed.')
        }
      } catch (error) {
        console.error('Middleware - Refresh request failed:', error)
      }

      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}
