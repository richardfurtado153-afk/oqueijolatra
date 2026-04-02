import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { FB_PIXEL_ID } from '@/lib/pixel'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://oqueijolatra.com.br'),
  title: {
    default: 'O Queijolatra | Queijos Artesanais e Especiais',
    template: '%s | O Queijolatra',
  },
  description:
    'Loja online de queijos artesanais brasileiros, importados e especiais. Queijos finos, cremosos, maturados e chocolates selecionados com carinho para a sua mesa.',
  keywords: [
    'queijos artesanais',
    'queijos especiais',
    'queijos brasileiros',
    'queijos finos',
    'comprar queijo online',
    'queijolatra',
    'queijos importados',
    'queijos cremosos',
    'chocolates artesanais',
  ],
  authors: [{ name: 'O Queijolatra' }],
  creator: 'O Queijolatra',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://oqueijolatra.com.br',
    siteName: 'O Queijolatra',
    title: 'O Queijolatra | Queijos Artesanais e Especiais',
    description:
      'Loja online de queijos artesanais brasileiros, importados e especiais. Selecionados com carinho para a sua mesa.',
    images: [
      {
        url: '/logo.png',
        width: 600,
        height: 600,
        alt: 'O Queijolatra - Queijos Artesanais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'O Queijolatra | Queijos Artesanais e Especiais',
    description:
      'Loja online de queijos artesanais brasileiros, importados e especiais.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <head>
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-[#faf7f2] text-stone-800 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
