import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={15} />
            Terug
          </Link>
          <span className="text-sm font-semibold text-arc-blue">ArcStage</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Page header */}
        <div className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Laatste wijziging: {lastUpdated}</p>
        </div>

        {/* Prose content */}
        <div className="prose-legal">
          {children}
        </div>

        {/* Footer links */}
        <footer className="mt-14 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] mb-3">Juridische documenten</p>
          <div className="flex flex-wrap gap-4">
            {[
              { href: '/privacy', label: 'Privacybeleid' },
              { href: '/terms', label: 'Servicevoorwaarden' },
              { href: '/gebruik', label: 'Gebruiksvoorwaarden' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-arc-blue hover:underline"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            &copy; {new Date().getFullYear()} ArcStage. Alle rechten voorbehouden.
          </p>
        </footer>
      </main>
    </div>
  )
}
