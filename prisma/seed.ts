import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import 'dotenv/config'
import path from 'path'

const dbPath = `file:${path.join(__dirname, 'dev.db')}`
const adapter = new PrismaBetterSqlite3({ url: dbPath })
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

  const CDN = 'https://cdn.awsli.com.br/300x300/1550/1550750/produto'

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
    imageUrl?: string
  }

  const productsData: ProductSeed[] = [
    // ── Queijos Artesanais (30-queijos-brasileiros) ──
    { name: 'Menu Degustação 10 Queijos + Mini Geléia', sku: '394', price: 299.00, weight: 2000, categoryId: catQueijosArtesanais.id, isBestseller: true, isNew: true, imageUrl: `${CDN}/180150581/kit_queijos6-5qvw9kxw7v.png` },
    { name: 'Cuitelinho (casca mofada) 170g', sku: '338', price: 29.00, compareAtPrice: 48.00, discountPercent: 40, weight: 170, categoryId: catQueijosArtesanais.id, isBestseller: true, imageUrl: `${CDN}/309793372/queijo_cuitelinho-xbaam763k1.png` },
    { name: 'Frescal de Búfala 250g', sku: '67', price: 28.90, weight: 250, categoryId: catQueijosArtesanais.id, isBestseller: true, imageUrl: `${CDN}/58888029/83ff9408ab.jpg` },
    { name: 'Gorgonzola Dolce 200g - Serra das Antas', sku: '89', price: 49.00, weight: 200, categoryId: catQueijosArtesanais.id, brandSlug: 'serra-das-antas', isBestseller: true, imageUrl: `${CDN}/209587611/gorgonzola_de_colher_serra_das_anta2-xfywxk.jpg` },
    { name: 'Guaiacá fração 200g', sku: '337', price: 39.00, compareAtPrice: 49.00, discountPercent: 20, weight: 200, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/318116194/queijo_guaiaca-smhavgwqkl.png` },
    { name: 'Matriarca (Cabra) 120g', sku: '103', price: 39.90, weight: 120, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/283413642/queijo_de_cabra_matriarca-33a6aydclt.png` },
    { name: 'Mantiqueira de Minas 250g', sku: '875', price: 35.00, compareAtPrice: 49.00, discountPercent: 29, weight: 250, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/399419201/mantiqueira3-wpxul5p5qh.jpeg` },
    { name: 'Azul de Pardinho 200g', sku: '79', price: 49.00, compareAtPrice: 60.00, discountPercent: 18, weight: 200, categoryId: catQueijosArtesanais.id, brandSlug: 'pardinho-artesanal', imageUrl: `${CDN}/272738619/queijo_azul_de_pardinho-xh0l1sr3r1.png` },
    { name: 'Cuesta Azul 150g', sku: '212', price: 39.00, compareAtPrice: 44.00, discountPercent: 11, weight: 150, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/123272061/queijo_cuesta_azul_4-nwrmhip9na.png` },
    { name: 'Canastra Fresco Militão 450g', sku: '24', price: 49.50, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'canastra', imageUrl: `${CDN}/226613787/queijo_canastra-p48tvb7l2v.png` },
    { name: 'Canastra Meia Cura Militão 450g', sku: '36', price: 69.50, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'canastra', imageUrl: `${CDN}/110320966/queijo_meia_cura_queijo_da_canastra-9hebaiqieh.png` },
    { name: 'Saint Marcelin 100g', sku: '210', price: 22.90, weight: 100, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/192263823/queijo_brie_redondo_2-usv568nhsp.png` },
    { name: 'Burrata de Búfala 200g', sku: '20', price: 39.90, weight: 200, categoryId: catQueijosArtesanais.id, isBestseller: true, imageUrl: `${CDN}/262788669/126-of2u5fc747.png` },
    { name: 'Requeijão de Corte c/ Raspa 450g', sku: '182', price: 69.00, weight: 450, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/115333716/requeij-o_de_corte_com_raspas_2-jvzu064sg3.png` },
    { name: 'Marajó (Búfala) 200g', sku: '111', price: 44.00, weight: 200, categoryId: catQueijosArtesanais.id, featured: true, imageUrl: `${CDN}/228287625/queijo_creme_do_maraj--gs41ro0gw7.png` },
    { name: 'Comte 250g - Serra das Antas', sku: '43', price: 64.90, weight: 250, categoryId: catQueijosArtesanais.id, brandSlug: 'serra-das-antas', featured: true, imageUrl: `${CDN}/360585470/queijo_gouda_holandes-y4dx8t13cn.png` },
    { name: 'Alvura Negra (Cabra) 150g', sku: '38', price: 55.90, weight: 150, categoryId: catQueijosArtesanais.id, featured: true, imageUrl: `${CDN}/293403454/queijo_de_cabra_brie__cabrie_mofado2-txbt8qwzyd.png` },
    { name: 'Paul Bartholdy 200g', sku: '73', price: 59.00, weight: 200, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/261023468/queijo_esta-o2-4rrv9jbvyp.png` },
    { name: 'Gouda Holandês 250g', sku: '191', price: 69.00, weight: 250, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/186448898/queijo_gouda-p9pfsryiry.png` },
    { name: 'Ovelha Vecchio 180d 150g', sku: '171', price: 49.00, compareAtPrice: 59.00, discountPercent: 17, weight: 150, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/58918125/a7ad95bc90.jpg` },
    { name: 'Ovelha Pupim 90d 150g', sku: '170', price: 49.00, weight: 150, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/358004076/queijo_pupim-0aigzy92hg.png` },
    { name: 'Cabrie (Cremoso de Cabra) 120g', sku: '104', price: 39.00, compareAtPrice: 45.00, discountPercent: 13, weight: 120, categoryId: catQueijosArtesanais.id, brandSlug: 'capril-do-bosque', imageUrl: `${CDN}/299698721/queijo_cremoso_de_cabra_capril_do_bosque-xcdtptorl0.png` },
    { name: 'Pirâmide do Bosque (Cabra) 100g', sku: '239', price: 49.00, weight: 100, categoryId: catQueijosArtesanais.id, brandSlug: 'capril-do-bosque', imageUrl: `${CDN}/302144803/queijo_artesanal_piramide_bosque-dl3fb9hrkf.png` },
    { name: 'Cacauzinho (Cabra) 100g', sku: '123', price: 39.00, weight: 100, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/299698968/queijo_cacauzinho_de_ovelha_capril_do_bosque-kmfxmw9xlz.png` },
    { name: 'Tulipa Negra 250g', sku: '459', price: 69.00, weight: 250, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/378011537/queijo_tulipa_negra-2-6eaquiyv12.png` },
    { name: 'Perdizes 400g', sku: '456', price: 99.00, weight: 400, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/377940664/queijo_perdizes-vgogwxctvt.png` },
    { name: 'Târoco Meia Cura 200g', sku: '116', price: 39.90, weight: 200, categoryId: catQueijosArtesanais.id, brandSlug: 'taroco', imageUrl: `${CDN}/366749412/queijo_manaca-aqtno7swsh.png` },
    { name: 'Butirro 450g', sku: '99', price: 69.00, weight: 450, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/266635063/queijo_butirro_roni-4hkljzw1p0.png` },
    { name: 'Capa Preta Bom Sucesso 450g', sku: '376-2', price: 59.00, compareAtPrice: 99.00, discountPercent: 40, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'fazenda-bom-sucesso', imageUrl: `${CDN}/399456983/queijo_bom_sucesso_capa_preta-lqhpy7r65c.PNG` },
    { name: 'Meia Cura Bom Sucesso 480g', sku: '370-3', price: 59.00, compareAtPrice: 99.00, discountPercent: 40, weight: 480, categoryId: catQueijosArtesanais.id, brandSlug: 'fazenda-bom-sucesso', imageUrl: `${CDN}/399456525/queijo_bom_sucesso-xvxhrp3rl9.PNG` },
    { name: 'Meia Cura Sara 450g', sku: '273', price: 49.00, compareAtPrice: 69.00, discountPercent: 29, weight: 450, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/399456437/queijo_meia_cura_sara-k9ay1fbjcr.PNG` },
    { name: 'Manteiga Dona Marta 450g', sku: '226', price: 49.00, compareAtPrice: 79.00, discountPercent: 38, weight: 450, categoryId: catQueijosArtesanais.id, brandSlug: 'dona-marta', imageUrl: `${CDN}/399209829/queijo_manteiga21-39c2lmc41j.png` },
    { name: 'Lá de Madre 12 meses 250g', sku: '128', price: 95.00, weight: 250, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/293403454/queijo_la_madre_tipo_12_meses_parmes-o_zero_lactose3-se4fvnxtga.png` },
    { name: 'Lá de Madre 9 meses 250g', sku: '127', price: 79.00, weight: 250, categoryId: catQueijosArtesanais.id, imageUrl: `${CDN}/293401053/queijo_la_madre_tipo_9_meses_parmes-o4-xofp9b0oov.png` },

    // ── Chocolates ──
    { name: 'Drágeas de Café c/ Chocolate 120g', sku: 'JWPVQ7ABS', price: 55.90, weight: 120, categoryId: catChocolates.id, brandSlug: 'invento', isNew: true, imageUrl: `${CDN}/398984237/caf-triangular-5psfhuk2x7.png` },
    { name: 'Drágeas Castanha de Caju 120g', sku: '6K3T6662Y', price: 55.90, weight: 120, categoryId: catChocolates.id, brandSlug: 'invento', imageUrl: `${CDN}/398984140/castanha-gispltuphr.jpeg` },
    { name: 'Chocolate 70% Amazônia Tocantins 70g', sku: 'VQ7FWAR5Y', price: 38.00, weight: 70, categoryId: catChocolates.id, brandSlug: 'invento', imageUrl: `${CDN}/398979586/amazonia-vermelha-xt96svvdnb.jpeg` },
    { name: 'Chocolate 70% Bahia Leolinda 70g', sku: 'S9CRMHP5Y', price: 38.00, weight: 70, categoryId: catChocolates.id, brandSlug: 'invento', imageUrl: `${CDN}/398979668/bahia-2bgap1ft9g.jpeg` },
    { name: 'Chocolate ao Leite 57% 58g', sku: '8TLN2QSPL', price: 30.90, weight: 58, categoryId: catChocolates.id, brandSlug: 'invento', imageUrl: `${CDN}/398978319/chocolate-ao-leitee-w4kkefzsed.jpeg` },

    // ── Bebidas ──
    { name: 'Vinho Branco Cannion Riesling', sku: '73S2PH4L6', price: 102.00, weight: 1000, categoryId: catBebidas.id, brandSlug: 'cannion', isNew: true, imageUrl: `${CDN}/367509718/licor_doce_leite_ovelha-x0vx82nj6k.png` },
    { name: 'Vinho Tinto Cannion Cabernet Sauvignon 2024', sku: 'QMM9T7KT7', price: 150.00, weight: 1000, categoryId: catBebidas.id, brandSlug: 'cannion', isNew: true, imageUrl: `${CDN}/367511047/licor_doce_leite_pistache-hpca57e4pp.png` },

    // ── Complementos ──
    { name: 'Doce de Leite Manna A2A2', sku: '230-4', price: 39.00, weight: 400, categoryId: catComplementos.id, brandSlug: 'manna', isNew: true, imageUrl: `${CDN}/399210355/doce_de_leite_a2-32vvp9q8k1.png` },
    { name: 'Marmelada 600g', sku: '225', price: 39.00, compareAtPrice: 54.90, discountPercent: 29, weight: 600, categoryId: catComplementos.id, imageUrl: `${CDN}/399209533/marmelada-hfh81s1zif.jpg` },
    { name: 'Laranja Caramel 500g', sku: '363', price: 79.00, weight: 500, categoryId: catComplementos.id, isBestseller: true, imageUrl: `${CDN}/376599177/geleia_laranja_laferme-iuf89jal8c.png` },
    { name: 'Geléia Tamara & Limão Siciliano 280g', sku: '467', price: 49.00, weight: 280, categoryId: catComplementos.id, imageUrl: `${CDN}/373500564/geleia_tamara-bw80bcz236.png` },

    // ── Doces ──
    { name: 'Doce Figo Caramelo 400g', sku: '435', price: 79.00, weight: 400, categoryId: catDoces.id, brandSlug: 'figo-ramy', imageUrl: `${CDN}/344528379/geleia_figo-o1pzoid875.png` },

    // ── Kits / Cestas ──
    { name: 'Seleção 5 Queijos Cremosos + Grissini', sku: '1031', price: 265.00, weight: 1500, categoryId: catKits.id, featured: true, imageUrl: `${CDN}/109182099/kit_queijos_cremosos-tzsed0qn7m.png` },
    { name: 'Seleção 6 Queijos Leite Crú + Mini Geléia', sku: '161', price: 199.00, weight: 2000, categoryId: catKits.id, imageUrl: `${CDN}/300305723/kit_queijos_leite_cr--4j1q03jc89.png` },
    { name: 'Tábua Especial 5 Queijos + Presunto Cru + 3 Acomp.', sku: 'KDR9VAEGL', price: 500.00, weight: 3000, categoryId: catKits.id, imageUrl: `${CDN}/180150581/kit_queijos6-5qvw9kxw7v.png` },
    { name: 'Cesta Páscoa 5 Queijos + Chocolate + Coelhinho', sku: 'R9QACK8HZ', price: 329.00, weight: 2500, categoryId: catCestas.id, featured: true, isNew: true, imageUrl: `${CDN}/399633838/cesta_pascoa_diferente_queijos2-upho34b9ss.PNG` },
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
            url: p.imageUrl || '/uploads/products/placeholder.jpg',
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
      { title: 'Presentes', imageUrl: 'https://cdn.awsli.com.br/1140x850/1550/1550750/banner/1-t6n72hcieb.png', link: '/cestas-de-presentes', position: 1, active: true },
      { title: '30 Queijos Artesanais', imageUrl: 'https://cdn.awsli.com.br/1140x850/1550/1550750/banner/1-t6n72hcieb.png', link: '/30-queijos-brasileiros', position: 2, active: true },
      { title: 'Queijos Artesanais', imageUrl: 'https://cdn.awsli.com.br/1140x850/1550/1550750/banner/1-t6n72hcieb.png', link: '/queijos', position: 3, active: true },
    ],
  })
  console.log('Created 3 banners.')

  const bcrypt = (await import('bcryptjs')).default
  const existingAdmin = await prisma.customer.findUnique({ where: { email: 'admin@queijolatra.com.br' } })
  if (!existingAdmin) {
    await prisma.customer.create({
      data: {
        name: 'Administrador',
        email: 'admin@queijolatra.com.br',
        passwordHash: await bcrypt.hash('admin123456', 10),
        isAdmin: true,
      },
    })
    console.log('Admin user created: admin@queijolatra.com.br / admin123456')
  }

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
