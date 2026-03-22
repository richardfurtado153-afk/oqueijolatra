import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('Seeding database...')

  // ── Delete all existing data (correct order for FK constraints) ──
  await prisma.favorite.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customerAddress.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()

  console.log('Cleared existing data.')

  // ── Brands ──
  const brandsData = [
    { name: 'Artesanal', slug: 'artesanal' },
    { name: 'Canastra', slug: 'canastra' },
    { name: 'Serra das Antas', slug: 'serra-das-antas' },
    { name: 'Fazenda São Victor', slug: 'fazenda-sao-victor' },
    { name: 'TARÔCO', slug: 'taroco' },
    { name: 'Pardinho Artesanal', slug: 'pardinho-artesanal' },
    { name: 'Capril do Bosque', slug: 'capril-do-bosque' },
    { name: 'Fazenda Santa Luzia', slug: 'fazenda-santa-luzia' },
    { name: 'Fazenda Bom Sucesso', slug: 'fazenda-bom-sucesso' },
    { name: 'Dona Marta', slug: 'dona-marta' },
    { name: 'Invento', slug: 'invento' },
    { name: 'Cannion', slug: 'cannion' },
    { name: 'Rima', slug: 'rima' },
    { name: 'Manna', slug: 'manna' },
    { name: 'Figo Ramy', slug: 'figo-ramy' },
  ]

  const brands: Record<string, { id: string }> = {}
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.create({ data: b })
  }
  console.log(`Created ${brandsData.length} brands.`)

  // ── Categories ──

  // Top-level
  const catQueijosArtesanais = await prisma.category.create({
    data: { name: '30 Queijos Artesanais Brasileiros', slug: '30-queijos-brasileiros', position: 1 },
  })
  const catChocolates = await prisma.category.create({
    data: { name: 'Chocolates', slug: 'chocolates', position: 2 },
  })
  const catQueijos = await prisma.category.create({
    data: { name: 'Queijos', slug: 'queijos', position: 3 },
  })
  const catSemanaConsumidor = await prisma.category.create({
    data: { name: 'Semana do Consumidor', slug: 'semana-do-consumidor', position: 4 },
  })
  const catCestas = await prisma.category.create({
    data: { name: 'Cestas de Presentes', slug: 'cestas-de-presentes', position: 5 },
  })
  const catKits = await prisma.category.create({
    data: { name: 'Kits Especiais', slug: 'kits', position: 6 },
  })
  const catComplementos = await prisma.category.create({
    data: { name: 'Geléias e Complementos', slug: 'complementos', position: 7 },
  })
  const catFondues = await prisma.category.create({
    data: { name: 'Fondues', slug: 'fondues', position: 8 },
  })
  const catCharcutaria = await prisma.category.create({
    data: { name: 'Charcutaria', slug: 'charcutaria', position: 9 },
  })
  const catBebidas = await prisma.category.create({
    data: { name: 'Bebidas', slug: 'bebidas', position: 10 },
  })
  const catDoces = await prisma.category.create({
    data: { name: 'Doces', slug: 'doces', position: 11 },
  })

  // Queijos subcategories
  const queijosSubcats = [
    { name: 'Brie', slug: 'brie' },
    { name: 'Queijos Azuis', slug: 'queijos-azuis' },
    { name: 'Queijos com Olhaduras', slug: 'queijos-com-olhaduras' },
    { name: 'Queijos Cremosos', slug: 'cremosos' },
    { name: 'Queijos de Búfala', slug: 'queijos-de-bufala' },
    { name: 'Queijos de Cabra', slug: 'queijos-de-cabra' },
    { name: 'Queijos de Ovelha', slug: 'queijos-de-ovelha' },
    { name: 'Queijos de Vaca', slug: 'queijos-de-vaca' },
    { name: 'Queijos Firmes e Duros', slug: 'firmes-e-duros' },
    { name: 'Queijos Frescos e Macios', slug: 'queijos-frescos' },
    { name: 'Queijos Meia Cura', slug: 'meia-cura' },
  ]

  const catSubMap: Record<string, { id: string }> = {}
  for (const sc of queijosSubcats) {
    catSubMap[sc.slug] = await prisma.category.create({
      data: { ...sc, parentId: catQueijos.id },
    })
  }

  // Queijos de Cabra sub-subcategory
  const catCabraFrescos = await prisma.category.create({
    data: {
      name: 'Queijos de Cabra Frescos',
      slug: 'queijos-de-cabra-frescos',
      parentId: catSubMap['queijos-de-cabra'].id,
    },
  })

  // Cestas subcategories
  const cestasSubcats = [
    { name: 'Presentes c/ Queijos', slug: 'cestas-de-presente-focada-em-queijos' },
    { name: 'Presentes c/ Queijos e Bebidas', slug: 'presentes-c-queijos-e-vinhos' },
    { name: 'Presentes c/ Queijos e Charcutaria', slug: 'presentes-c-queijos-e-charcutaria' },
    { name: 'Presentes c/ Queijos e Doces', slug: 'presentes-c-queijos-e-doces' },
  ]
  for (const sc of cestasSubcats) {
    await prisma.category.create({
      data: { ...sc, parentId: catCestas.id },
    })
  }

  // Doces subcategories
  const catDocesDeC = await prisma.category.create({
    data: { name: 'Doces de Caixa', slug: 'doces-de-caixa', parentId: catDoces.id },
  })
  const catDocesFigo = await prisma.category.create({
    data: { name: 'Doces de Figo', slug: 'doces-de-figo', parentId: catDoces.id },
  })
  const catFigoRamy = await prisma.category.create({
    data: { name: 'Figo Ramy', slug: 'figo-ramy-cat', parentId: catDocesFigo.id },
  })

  console.log('Created all categories.')

  // ── Products ──

  interface ProductSeed {
    name: string
    sku: string
    price: number
    compareAtPrice?: number
    discountPercent?: number
    weight: number
    categoryId: string
    brandSlug?: string
    isBestseller?: boolean
    isNew?: boolean
    featured?: boolean
  }

  const productsData: ProductSeed[] = [
    // ── Queijos Artesanais (30-queijos-brasileiros) ──
    { name: 'Menu Degustação 10 Queijos + Mini Geléia', sku: '394', price: 299.00, weight: 2000, categoryId: catQueijosArtesanais.id, isBestseller: true, isNew: true },
    { name: 'Cuitelinho (casca mofada) 170g', sku: '338', price: 29.00, compareAtPrice: 48.00, discountPercent: 40, weight: 170, categoryId: catQueijosArtesanais.id, isBestseller: true },
    { name: 'Frescal de Búfala 250g', sku: '67', price: 28.90, weight: 250, categoryId: catQueijosArtesanais.id, isBestseller: true },
    { name: 'Gorgonzola Dolce 200g - Serra das Antas', sku: '89', price: 49.00, weight: 200, categoryId: catQueijosArtesanais.id, brandSlug: 'serra-das-antas', isBestseller: true },
    { name: 'Guaiacá fração 200g', sku: '337', price: 39.00, compareAtPrice: 49.00, discountPercent: 20, weight: 200, categoryId: catQueijosArtesanais.id },
    { name: 'Matriarca (Cabra) 120g', sku: '103', price: 39.90, weight: 120, categoryId: catQueijosArtesanais.id },
    { name: 'Mantiqueira de Minas 250g', sku: '875', price: 35.00, compareAtPrice: 49.00, discountPercent: 29, weight: 250, categoryId: catQueijosArtesanais.id },
    { name: 'Azul de Pardinho 200g', sku: '79', price: 49.00, compareAtPrice: 60.00, discountPercent: 18, weight: 200, categoryId: catQueijosArtesanais.id, brandSlug: 'pardinho-artesanal' },
    { name: 'Cuesta Azul 150g', sku: '212', price: 39.00, compareAtPrice: 44.00, discountPercent: 11, weight: 150, categoryId: catQueijosArtesanais.id },
    { name: 'Canastra Fresco Militão 450g', sku: '24', price: 49.50, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'canastra' },
    { name: 'Canastra Meia Cura Militão 450g', sku: '36', price: 69.50, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'canastra' },
    { name: 'Saint Marcelin 100g', sku: '210', price: 22.90, weight: 100, categoryId: catQueijosArtesanais.id },
    { name: 'Burrata de Búfala 200g', sku: '20', price: 39.90, weight: 200, categoryId: catQueijosArtesanais.id, isBestseller: true },
    { name: 'Requeijão de Corte c/ Raspa 450g', sku: '182', price: 69.00, weight: 450, categoryId: catQueijosArtesanais.id },
    { name: 'Marajó (Búfala) 200g', sku: '111', price: 44.00, weight: 200, categoryId: catQueijosArtesanais.id, featured: true },
    { name: 'Comte 250g - Serra das Antas', sku: '43', price: 64.90, weight: 250, categoryId: catQueijosArtesanais.id, brandSlug: 'serra-das-antas', featured: true },
    { name: 'Alvura Negra (Cabra) 150g', sku: '38', price: 55.90, weight: 150, categoryId: catQueijosArtesanais.id, featured: true },
    { name: 'Paul Bartholdy 200g', sku: '73', price: 59.00, weight: 200, categoryId: catQueijosArtesanais.id },
    { name: 'Gouda Holandês 250g', sku: '191', price: 69.00, weight: 250, categoryId: catQueijosArtesanais.id },
    { name: 'Ovelha Vecchio 180d 150g', sku: '171', price: 49.00, compareAtPrice: 59.00, discountPercent: 17, weight: 150, categoryId: catQueijosArtesanais.id },
    { name: 'Ovelha Pupim 90d 150g', sku: '170', price: 49.00, weight: 150, categoryId: catQueijosArtesanais.id },
    { name: 'Cabrie (Cremoso de Cabra) 120g', sku: '104', price: 39.00, compareAtPrice: 45.00, discountPercent: 13, weight: 120, categoryId: catQueijosArtesanais.id, brandSlug: 'capril-do-bosque' },
    { name: 'Pirâmide do Bosque (Cabra) 100g', sku: '239', price: 49.00, weight: 100, categoryId: catQueijosArtesanais.id, brandSlug: 'capril-do-bosque' },
    { name: 'Cacauzinho (Cabra) 100g', sku: '123', price: 39.00, weight: 100, categoryId: catQueijosArtesanais.id },
    { name: 'Tulipa Negra 250g', sku: '459', price: 69.00, weight: 250, categoryId: catQueijosArtesanais.id },
    { name: 'Perdizes 400g', sku: '456', price: 99.00, weight: 400, categoryId: catQueijosArtesanais.id },
    { name: 'Târoco Meia Cura 200g', sku: '116', price: 39.90, weight: 200, categoryId: catQueijosArtesanais.id, brandSlug: 'taroco' },
    { name: 'Butirro 450g', sku: '99', price: 69.00, weight: 450, categoryId: catQueijosArtesanais.id },
    { name: 'Capa Preta Bom Sucesso 450g', sku: '376-2', price: 59.00, compareAtPrice: 99.00, discountPercent: 40, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'fazenda-bom-sucesso' },
    { name: 'Meia Cura Bom Sucesso 480g', sku: '370-3', price: 59.00, compareAtPrice: 99.00, discountPercent: 40, weight: 480, categoryId: catQueijosArtesanais.id, brandSlug: 'fazenda-bom-sucesso' },
    { name: 'Meia Cura Sara 450g', sku: '273', price: 49.00, compareAtPrice: 69.00, discountPercent: 29, weight: 450, categoryId: catQueijosArtesanais.id },
    { name: 'Manteiga Dona Marta 450g', sku: '226', price: 49.00, compareAtPrice: 79.00, discountPercent: 38, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'dona-marta' },
    { name: 'Lá de Madre 12 meses 250g', sku: '128', price: 95.00, weight: 250, categoryId: catQueijosArtesanais.id },
    { name: 'Lá de Madre 9 meses 250g', sku: '127', price: 79.00, weight: 250, categoryId: catQueijosArtesanais.id },

    // ── Chocolates (brand: invento) ──
    { name: 'Drágeas de Café c/ Chocolate 120g', sku: 'JWPVQ7ABS', price: 55.90, weight: 120, categoryId: catChocolates.id, brandSlug: 'invento', isNew: true },
    { name: 'Drágeas Castanha de Caju 120g', sku: '6K3T6662Y', price: 55.90, weight: 120, categoryId: catChocolates.id, brandSlug: 'invento' },
    { name: 'Chocolate 70% Amazônia Tocantins 70g', sku: 'VQ7FWAR5Y', price: 38.00, weight: 70, categoryId: catChocolates.id, brandSlug: 'invento' },
    { name: 'Chocolate 70% Bahia Leolinda 70g', sku: 'S9CRMHP5Y', price: 38.00, weight: 70, categoryId: catChocolates.id, brandSlug: 'invento' },
    { name: 'Chocolate ao Leite 57% 58g', sku: '8TLN2QSPL', price: 30.90, weight: 58, categoryId: catChocolates.id, brandSlug: 'invento' },

    // ── Bebidas (brand: cannion) ──
    { name: 'Vinho Branco Cannion Riesling', sku: '73S2PH4L6', price: 102.00, weight: 1000, categoryId: catBebidas.id, brandSlug: 'cannion', isNew: true },
    { name: 'Vinho Tinto Cannion Cabernet Sauvignon 2024', sku: 'QMM9T7KT7', price: 150.00, weight: 1000, categoryId: catBebidas.id, brandSlug: 'cannion', isNew: true },

    // ── Complementos ──
    { name: 'Doce de Leite Manna A2A2', sku: '230-4', price: 39.00, weight: 400, categoryId: catComplementos.id, brandSlug: 'manna', isNew: true },
    { name: 'Marmelada 600g', sku: '225', price: 39.00, compareAtPrice: 54.90, discountPercent: 29, weight: 600, categoryId: catComplementos.id },
    { name: 'Laranja Caramel 500g', sku: '363', price: 79.00, weight: 500, categoryId: catComplementos.id, isBestseller: true },
    { name: 'Geléia Tamara & Limão Siciliano 280g', sku: '467', price: 49.00, weight: 280, categoryId: catComplementos.id },

    // ── Doces ──
    { name: 'Doce Figo Caramelo 400g', sku: '435', price: 79.00, weight: 400, categoryId: catDoces.id, brandSlug: 'figo-ramy' },

    // ── Kits / Cestas ──
    { name: 'Seleção 5 Queijos Cremosos + Grissini', sku: '1031', price: 265.00, weight: 1500, categoryId: catKits.id, featured: true },
    { name: 'Seleção 6 Queijos Leite Crú + Mini Geléia', sku: '161', price: 199.00, weight: 2000, categoryId: catKits.id },
    { name: 'Tábua Especial 5 Queijos + Presunto Cru + 3 Acomp.', sku: 'KDR9VAEGL', price: 500.00, weight: 3000, categoryId: catKits.id },
    { name: 'Cesta Páscoa 5 Queijos + Chocolate + Coelhinho', sku: 'R9QACK8HZ', price: 329.00, weight: 2500, categoryId: catCestas.id, featured: true, isNew: true },
  ]

  let productCount = 0
  for (const p of productsData) {
    const slug = slugify(p.name)
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        sku: p.sku,
        description: '',
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        discountPercent: p.discountPercent ?? null,
        stock: 100,
        weight: p.weight,
        categoryId: p.categoryId,
        brandId: p.brandSlug ? brands[p.brandSlug].id : null,
        isBestseller: p.isBestseller ?? false,
        isNew: p.isNew ?? false,
        featured: p.featured ?? false,
        images: {
          create: {
            url: '/uploads/products/placeholder.jpg',
            alt: p.name,
            position: 0,
            isMain: true,
          },
        },
      },
    })
    productCount++
  }
  console.log(`Created ${productCount} products.`)

  // ── Banners ──
  await prisma.banner.createMany({
    data: [
      { title: 'Cestas de Presentes', imageUrl: '/uploads/banners/cestas.jpg', link: '/cestas-de-presentes', position: 1, active: true },
      { title: '30 Queijos Artesanais', imageUrl: '/uploads/banners/queijos-artesanais.jpg', link: '/30-queijos-brasileiros', position: 2, active: true },
      { title: 'Chocolates Invento', imageUrl: '/uploads/banners/chocolates.jpg', link: '/chocolates', position: 3, active: true },
    ],
  })
  console.log('Created 3 banners.')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
