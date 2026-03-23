import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Protect /admin routes: must be authenticated and isAdmin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/conta/login?callbackUrl=/admin', request.url))
    }
    if (!token.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect /checkout and /conta/* (except login and cadastro)
  const protectedRoute =
    pathname.startsWith('/checkout') ||
    (pathname.startsWith('/conta') && !pathname.startsWith('/conta/login') && !pathname.startsWith('/conta/cadastro'))

  if (protectedRoute && !token) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/conta/login?callbackUrl=${callbackUrl}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/conta/((?!login|cadastro).*)', '/checkout/:path*'],
}
