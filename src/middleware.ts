import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // SECURITY: CSRF protection for API mutation routes
  // Reject POST/PUT/DELETE/PATCH to API routes if Origin doesn't match (except webhooks)
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/webhooks/') &&
    request.method !== 'GET' &&
    request.method !== 'HEAD'
  ) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ error: 'Requisicao bloqueada' }, { status: 403 })
      }
    }
  }

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

  // Protect /checkout and /conta/* (except login, cadastro, esqueci-senha, redefinir-senha)
  const publicContaPages = ['/conta/login', '/conta/cadastro', '/conta/esqueci-senha', '/conta/redefinir-senha']
  const protectedRoute =
    pathname.startsWith('/checkout') ||
    (pathname.startsWith('/conta') && !publicContaPages.some(p => pathname.startsWith(p)))

  if (protectedRoute && !token) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/conta/login?callbackUrl=${callbackUrl}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/conta/((?!login|cadastro|esqueci-senha|redefinir-senha).*)', '/checkout/:path*', '/api/:path*'],
}
