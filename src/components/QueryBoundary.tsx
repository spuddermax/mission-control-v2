import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

import { Button } from '@/components/ui/button'

type QueryBoundaryProps = {
  children: ReactNode
}

export function QueryBoundary({ children }: QueryBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => {
        const message = error instanceof Error ? error.message : null
        return (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-6 text-sm text-rose-900">
            <p className="text-base font-semibold">Something broke while loading missions.</p>
            <p className="mt-1 text-rose-800/90">
              {message ?? 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="mt-4">
              <Button variant="outline" onClick={resetErrorBoundary}>
                Reload data
              </Button>
            </div>
          </div>
        )
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
