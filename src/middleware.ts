import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/conta/login' },
})

export const config = {
  matcher: ['/conta/((?!login|cadastro).*)', '/checkout/:path*'],
}
