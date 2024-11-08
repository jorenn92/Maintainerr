import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const apiPort = process.env.API_PORT || 3001

export function middleware(request: NextRequest) {
  const destination = new URL(`http://localhost:${apiPort}`)
  const url = request.nextUrl.clone()
  url.host = destination.host
  url.port = destination.port
  url.protocol = destination.protocol
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: '/api/:path*',
}
