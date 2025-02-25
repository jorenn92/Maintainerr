import { NextResponse, NextRequest } from 'next/server'

const apiPort = process.env.API_PORT || 3001

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // ✅ Check if this is an API request and rewrite it
  if (url.pathname.startsWith('/api/')) {
    const destination = new URL(`http://localhost:${apiPort}`)
    url.host = destination.host
    url.port = destination.port
    url.protocol = destination.protocol
    url.basePath = ''
    return NextResponse.rewrite(url)
  }

  // ✅ Fetch `authEnabled` only for non-API requests
  try {
    const res = await fetch(
      `http://localhost:${apiPort}/api/authentication/settings`,
      {
        credentials: 'include',
      },
    )
    const data = await res.json()

    // ✅ Inject `authEnabled` as a response header
    const response = NextResponse.next()
    response.headers.set('X-Auth-Enabled', String(data.authEnabled))
    return response
  } catch (error) {
    console.error('Failed to fetch authentication settings:', error)
    return NextResponse.next()
  }
}
