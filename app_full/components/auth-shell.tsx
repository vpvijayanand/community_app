import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { KolamMark } from "@/components/kolam-mark"

type AuthShellProps = {
  title: string
  titleTamil?: string
  subtitle: string
  quote?: {
    english: string
    tamil: string
    attribution: string
  }
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({
  title,
  titleTamil,
  subtitle,
  quote,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Visual side */}
        <aside className="relative hidden overflow-hidden bg-primary lg:block">
          <Image
            src="/auth-hero.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-90"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-background/10"
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-primary-foreground">
            <Link href="/" className="inline-flex items-center gap-3">
              <KolamMark className="h-10 w-10 text-primary-foreground" strokeWidth={1.2} />
              <div className="leading-tight">
                <p className="font-serif text-2xl font-medium">Maratha</p>
                <p className="font-tamil text-xs opacity-80">மராத்தா</p>
              </div>
            </Link>

            {quote && (
              <blockquote className="max-w-md space-y-3">
                <p className="font-serif text-2xl leading-snug text-balance">
                  &ldquo;{quote.english}&rdquo;
                </p>
                <p className="font-tamil text-base leading-relaxed text-primary-foreground/90">
                  &ldquo;{quote.tamil}&rdquo;
                </p>
                <footer className="pt-1 text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                  — {quote.attribution}
                </footer>
              </blockquote>
            )}
          </div>
        </aside>

        {/* Form side */}
        <main className="flex flex-col">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <KolamMark className="h-7 w-7" />
              <span className="font-serif text-lg font-medium">Maratha</span>
            </Link>
            <Link
              href="/"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Back to home
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-md">
              <header className="mb-8 space-y-2">
                <p className="font-tamil text-sm text-primary">{titleTamil}</p>
                <h1 className="font-serif text-3xl font-medium leading-tight text-foreground text-balance sm:text-4xl">
                  {title}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {subtitle}
                </p>
              </header>

              {children}

              {footer && (
                <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
