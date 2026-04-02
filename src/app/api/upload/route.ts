import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { apiSuccess, apiError, requireAdmin } from '@/lib/api'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '5242880')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  // SECURITY: Only admins can upload files
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const productSlug = formData.get('productSlug') as string | null
  const index = formData.get('index') as string | null

  if (!file) return apiError('Arquivo obrigatorio')
  if (!ALLOWED_TYPES.includes(file.type)) return apiError('Formato nao suportado. Use JPG, PNG ou WebP.')
  if (file.size > MAX_SIZE) return apiError('Arquivo muito grande. Maximo 5MB.')

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  // SECURITY: Sanitize slug to prevent path traversal
  const slug = (productSlug || 'upload').replace(/[^a-zA-Z0-9_-]/g, '')
  const idx = String(parseInt(index || '0') || 0)
  const unique = crypto.randomBytes(8).toString('hex')
  const filename = `${slug}-${unique}-${idx}.${ext}`
  const dir = path.resolve(UPLOAD_DIR, 'products')

  await mkdir(dir, { recursive: true })

  // SECURITY: Verify resolved path stays within upload directory
  const filePath = path.resolve(dir, filename)
  if (!filePath.startsWith(dir)) {
    return apiError('Caminho invalido')
  }

  await writeFile(filePath, buffer)

  return apiSuccess({ url: `/uploads/products/${filename}` }, 201)
}
