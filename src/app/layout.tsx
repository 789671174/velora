import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = { title: 'Salon CRM', description: 'Booking and calendar demo' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="container flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="font-semibold">Salon CRM v0.9.1</span>
            </div>
            <nav className="flex items-center gap-2">
              <Link className="btn" href="/entrepreneur">Unternehmer</Link>
              <Link className="btn" href="/client">Kunde buchen</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-6 text-sm opacity-70">
          <div>Timezone: Europe/Zurich • Demo: E-Mail/SMS werden lokal simuliert. Für Produktion ENV setzen.</div>
        </footer>
      </body>
    </html>
  )
}
