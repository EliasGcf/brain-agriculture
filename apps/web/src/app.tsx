import { NuqsAdapter } from 'nuqs/adapters/react-router/v8'
import { Provider } from 'react-redux'

import { Toaster } from '@components/ui/sonner'
import './index.css'

import { AppRoutes } from './routes.tsx'
import { apiStore } from './store/store'

export function App() {
  return (
    <NuqsAdapter>
      <Provider store={apiStore}>
        <AppRoutes />
      </Provider>
      <Toaster />
    </NuqsAdapter>
  )
}
