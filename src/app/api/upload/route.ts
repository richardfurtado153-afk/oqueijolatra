import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '5242880')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const productSlug = formData.get('productSlug') as string | null
  const index = formData.get('index') as string | null

  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Formato não suportado. Use JPG, PNG ou WebP.' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  const slug = productSlug || 'upload'
  const idx = index || '0'
  const filename = `${slug}-${Date.now()}-${idx}.${ext}`
  const dir = path.join(UPLOAD_DIR, 'products')

  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)

  return NextResponse.json({ url: `/uploads/products/${filename}` }, { status: 201 })
}
