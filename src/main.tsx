import React from 'react'
import ReactDOM from 'react-dom/client'
import { httpBatchLink } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import App from './App'
import './index.css'
import { trpc } from './utils/trpc'
import { TasksPage } from './features/tasks/TasksPage'
import { QueryBoundary } from './components/QueryBoundary'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <QueryBoundary>
            <TasksPage />
          </QueryBoundary>
        ),
      },
    ],
  },
])

ensureReactQueryCompatPrototype()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
})

ensureReactQueryCompat(queryClient)

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
})

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:3000'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
)

const missingMutationDefaults = (() => undefined) as unknown as QueryClient['getMutationDefaults']
const missingQueryDefaults = (() => undefined) as unknown as QueryClient['getQueryDefaults']

function ensureReactQueryCompatPrototype() {
  const proto = QueryClient.prototype as QueryClient & {
    getMutationDefaults?: QueryClient['getMutationDefaults']
    getQueryDefaults?: QueryClient['getQueryDefaults']
  }

  if (typeof proto.getMutationDefaults !== 'function') {
    proto.getMutationDefaults = missingMutationDefaults
  }
  if (typeof proto.getQueryDefaults !== 'function') {
    proto.getQueryDefaults = missingQueryDefaults
  }
}
function ensureReactQueryCompat(client: QueryClient) {
  const compatClient = client as QueryClient & {
    getMutationDefaults?: QueryClient['getMutationDefaults']
    getQueryDefaults?: QueryClient['getQueryDefaults']
  }

  if (typeof compatClient.getMutationDefaults !== 'function') {
    compatClient.getMutationDefaults = missingMutationDefaults
  }
  if (typeof compatClient.getQueryDefaults !== 'function') {
    compatClient.getQueryDefaults = missingQueryDefaults
  }
}
