import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './index.css'

import { AppRoutes } from './routes.tsx'
import { apiStore } from './store/store'

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('./msw')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={apiStore}>
      <AppRoutes />
    </Provider>
  </StrictMode>,
)
