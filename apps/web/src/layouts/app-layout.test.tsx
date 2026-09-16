import { fireEvent, screen, waitFor } from '@testing-library/react'

import { AppRoutes } from '../routes'
import { renderWithProviders } from '../../tests/test-utils'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return renderWithProviders(<AppRoutes />)
}

afterEach(() => {
  window.innerWidth = 1024
})

describe('application layout', () => {
  it('allows the desktop sidebar to be collapsed and expanded', async () => {
    renderAt('/')

    const toggle = await screen.findByRole('button', {
      name: 'Abrir ou recolher navegação',
    })
    const sidebar = document.querySelector('[data-slot="sidebar"][data-state]')

    expect(sidebar).toHaveAttribute('data-state', 'expanded')

    fireEvent.click(toggle)

    expect(sidebar).toHaveAttribute('data-state', 'collapsed')
  })

  it('opens the mobile navigation from the menu trigger', async () => {
    window.innerWidth = 375
    renderAt('/')

    const toggle = await screen.findByRole('button', {
      name: 'Abrir ou recolher navegação',
    })

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Produtores' })).toBeVisible()
    })
  })

  it('should be able to return to the previous page with the back button', async () => {
    window.history.pushState({}, '', '/')
    renderAt('/producers')

    fireEvent.click(await screen.findByRole('button', { name: 'Voltar' }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Dashboard agrícola' }),
      ).toBeInTheDocument()
    })
  })
})
