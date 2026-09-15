import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './index.css'

import { AppRoutes } from './routes.tsx'
import { apiStore } from './store/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={apiStore}>
      <AppRoutes />
    </Provider>
  </StrictMode>,
)
