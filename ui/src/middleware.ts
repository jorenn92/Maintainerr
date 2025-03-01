import { NextResponse, NextRequest } from 'next/server'

const apiPort = process.env.API_PORT || 3001

<<<<<<< HEAD
export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    !request.nextUrl.pathname.startsWith('/api/logs/stream')
  ) {
    const url = request.nextUrl.clone()
=======
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
>>>>>>> b8f6f94 (feat: implement authentication module with middleware and settings management)
    const destination = new URL(`http://localhost:${apiPort}`)
    url.host = destination.host
    url.port = destination.port
    url.protocol = destination.protocol
    url.basePath = ''
    return NextResponse.rewrite(url)
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
  // ✅ If no session token exists and auth is enabled, redirect to /login
  if (!sessionToken) {
    console.log('Middleware - Not authenticated, redirecting to /login')
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
