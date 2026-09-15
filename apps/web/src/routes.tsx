import { BrowserRouter, Route, Routes } from 'react-router'

import { AppLayout } from './layouts/app-layout'
import { DashboardPage } from './pages/dashboard/dashboard.page'
import { FarmsPage } from './pages/farms.page'
import { ListProducersPage } from './pages/producers/list-producers.page'
import { CreateProducerPage } from './pages/producers/create-producer.page'
import { EditProducerPage } from './pages/producers/edit-producer.page'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/producers" element={<ListProducersPage />} />
          <Route path="/producers/new" element={<CreateProducerPage />} />
          <Route path="/producers/:producerId" element={<EditProducerPage />} />
          <Route path="/farms" element={<FarmsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
