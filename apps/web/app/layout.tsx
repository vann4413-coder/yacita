import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Yacita', template: '%s | Yacita' },
  description: 'Marketplace de última hora para el sector salud y bienestar en España.',
  keywords: ['fisioterapia', 'masajes', 'quiropráctica', 'descuentos', 'citas', 'última hora'],
  openGraph: {
    title: 'Yacita',
    description: 'Convierte huecos en citas',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
