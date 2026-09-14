import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'

import { SidebarProvider } from '@components/ui/sidebar'

import { SidebarNavigation } from './sidebar-navigation'

function CurrentRoute() {
  const location = useLocation()

  return <output aria-label="Current route">{location.pathname}</output>
}

function renderNavigation() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <SidebarProvider>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <SidebarNavigation />
                <CurrentRoute />
              </>
            }
          />
        </Routes>
      </SidebarProvider>
    </MemoryRouter>,
  )
}

describe('sidebar navigation', () => {
  it.each([
    ['Dashboard', '/'],
    ['Produtores', '/produtores'],
    ['Fazendas', '/farms'],
  ])('should be able to navigate to %s', (label, path) => {
    renderNavigation()

    fireEvent.click(screen.getByRole('link', { name: label }))

    expect(screen.getByRole('status', { name: 'Current route' })).toHaveTextContent(path)
  })
})
