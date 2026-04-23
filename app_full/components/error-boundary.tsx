"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary with branded Tamil-first fallback UI.
 * Wrap around route segments or feature sections.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
          </div>

          <div className="max-w-sm space-y-2">
            <h2 className="font-serif text-xl font-medium text-foreground">
              ஏதோ தவறு நடந்தது
            </h2>
            <p className="font-tamil text-sm text-muted-foreground">
              மீண்டும் முயற்சிக்கவும் அல்லது முகப்புக்கு செல்லவும்.
            </p>
            <p className="text-xs text-muted-foreground">
              Something went wrong. Please try again or go home.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="max-w-lg overflow-auto rounded-lg border border-border bg-muted p-3 text-left text-xs text-destructive">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              மீண்டும் முயற்சி
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Home className="h-4 w-4" aria-hidden />
              முகப்பு
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
