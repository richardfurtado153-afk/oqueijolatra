import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** Standard success response */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

/** Standard error response */
export function apiError(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

/** Get authenticated customer ID or return null */
export async function getAuthCustomerId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session.user.id
}

/** Require authenticated customer, returns ID or error response */
export async function requireAuth(): Promise<
  { customerId: string; error?: never } | { customerId?: never; error: NextResponse }
> {
  const customerId = await getAuthCustomerId()
  if (!customerId) {
    return { error: apiError('Nao autenticado', 401) }
  }
  return { customerId }
}

/** Require admin session, returns customer ID or error response */
export async function requireAdmin(): Promise<
  { customerId: string; error?: never } | { customerId?: never; error: NextResponse }
> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: apiError('Nao autenticado', 401) }
  }
  if (!session.user.isAdmin) {
    return { error: apiError('Sem permissao', 403) }
  }
  return { customerId: session.user.id }
}

/** Safely parse JSON body, returns parsed data or error response */
export async function parseBody<T>(request: Request): Promise<
  { data: T; error?: never } | { data?: never; error: NextResponse }
> {
  try {
    const data = await request.json() as T
    return { data }
  } catch {
    return { error: apiError('Corpo da requisicao invalido', 400) }
  }
}

/** Generate URL-safe slug from text */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
