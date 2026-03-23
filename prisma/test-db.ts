import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import path from 'path'

async function main() {
  const dbPath = `file:${path.join(__dirname, 'dev.db')}`
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  const prisma = new PrismaClient({ adapter })
  const count = await prisma.product.count()
  console.log('products in db:', count)
  const banners = await prisma.banner.count()
  console.log('banners in db:', banners)
  await prisma.$disconnect()
}

main().catch(console.error)
