import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Unsent - Mensajes que nunca se enviaron',
  description: 'Escribe mensajes que nunca serán enviados. Una app para procesar emociones y encontrar cierre.',
  keywords: ['mensajes', 'emociones', 'cierre', 'terapia', 'reflexión', 'cartas no enviadas'],
  authors: [{ name: 'Unsent Team' }],
  creator: 'Unsent',
  publisher: 'Unsent',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://unsent.app'),
  openGraph: {
    title: 'Unsent - Mensajes que nunca se enviaron',
    description: 'Un espacio seguro para escribir lo que nunca pudiste decir. Procesa tus emociones y encuentra la paz.',
    url: 'https://unsent.app',
    siteName: 'Unsent',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Unsent - Mensajes que nunca se enviaron',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unsent - Mensajes que nunca se enviaron',
    description: 'Un espacio seguro para escribir lo que nunca pudiste decir.',
    creator: '@unsent_app',
    images: ['/twitter-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Unsent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Unsent" />
        <meta name="msapplication-TileColor" content="#0f0f0f" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
} 