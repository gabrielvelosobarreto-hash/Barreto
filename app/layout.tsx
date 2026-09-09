import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Barreto App',
  description: 'Sistema residencial inteligente para gestão de compras, setores, prioridades e controle de manutenções com visão macro e micro.',
  openGraph: {
    title: 'Barreto App',
    description: 'Sistema residencial inteligente para gestão de compras, setores, prioridades e controle de manutenções com visão macro e micro.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barreto App',
    description: 'Sistema residencial inteligente para gestão de compras, setores, prioridades e controle de manutenções com visão macro e micro.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
