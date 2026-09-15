import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from "@app.tsx"

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('./msw')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
