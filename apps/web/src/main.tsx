import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from "@app.tsx"
import { env } from "@env"

if (env.DEV && env.VITE_ENABLE_MSW) {
  const { worker } = await import('./msw')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
