import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Car Cleaning Admin"' },
    })
  }

  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
  const [username, password] = decoded.split(':')

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Car Cleaning Admin"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
