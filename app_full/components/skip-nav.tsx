/**
 * Skip navigation link — first focusable element in the DOM.
 * Visually hidden until focused, then slides into view.
 */
export function SkipNavLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>
  )
}
