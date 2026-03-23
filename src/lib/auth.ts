import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email },
        })
        if (!customer) return null
        const isValid = await bcrypt.compare(credentials.password, customer.passwordHash)
        if (!isValid) return null
        return { id: customer.id, name: customer.name, email: customer.email, isAdmin: customer.isAdmin }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/conta/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as any).isAdmin ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).isAdmin = token.isAdmin
      }
      return session
    },
  },
}
