import { BrowserRouter, Route, Routes } from 'react-router'

import { AppLayout } from './layouts/app-layout'
import { DashboardPage } from './pages/dashboard.page'
import { FarmsPage } from './pages/farms.page'
import { ProducersPage } from './pages/producers.page'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtores" element={<ProducersPage />} />
          <Route path="/farms" element={<FarmsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
