import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '../../routes'
import { renderWithProviders } from '../../../tests/test-utils'

const ADA_ID = '00000000-0000-4000-8000-000000000001'
const BRUNO_ID = '00000000-0000-4000-8000-000000000005'
const CORA_ID = '00000000-0000-4000-8000-000000000006'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return renderWithProviders(<AppRoutes />)
}

describe('producer detail route', () => {
  it('should be able to load and update a producer through the API', async () => {
    renderAt(`/producers/${BRUNO_ID}`)
    expect(await screen.findByRole('heading', { name: 'Bruno Rural' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), { target: { value: 'Bruno Rural Atualizado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))
    expect(await screen.findByRole('heading', { name: 'Bruno Rural Atualizado' })).toBeInTheDocument()
    expect(window.location.pathname).toBe(`/producers/${BRUNO_ID}`)
  })

  it('should be able to list the producer farms inside the producer detail', async () => {
    renderAt(`/producers/${ADA_ID}`)

    expect(await screen.findByRole('cell', { name: 'Green Acres' })).toBeInTheDocument()
    expect(screen.getByText('Salvador, BA')).toBeInTheDocument()
  })

  it('should display a server rejection when deleting a producer with farms', async () => {
    renderAt(`/producers/${ADA_ID}`)
    await screen.findByRole('heading', { name: 'Ada Rural' })
    fireEvent.click(screen.getByRole('button', { name: 'Excluir produtor' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))
    expect(await screen.findByText('O produtor possui fazendas.')).toBeInTheDocument()
    expect(window.location.pathname).toBe(`/producers/${ADA_ID}`)
  })

  it('should be able to delete a producer through the API and navigate to the list', async () => {
    renderAt(`/producers/${CORA_ID}`)
    await screen.findByRole('heading', { name: 'Cora Rural' })
    fireEvent.click(screen.getByRole('button', { name: 'Excluir produtor' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))
    await waitFor(() => expect(window.location.pathname).toBe('/producers'))
    expect(await screen.findByText('Bruno Rural')).toBeInTheDocument()
    expect(screen.queryByText('Cora Rural')).not.toBeInTheDocument()
  })

  it('should show the not-found state after returning to a deleted producer detail', async () => {
    renderAt(`/producers/${CORA_ID}`)
    await screen.findByRole('heading', { name: 'Cora Rural' })
    fireEvent.click(screen.getByRole('button', { name: 'Excluir produtor' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))
    await waitFor(() => expect(window.location.pathname).toBe('/producers'))
    await screen.findByText('Bruno Rural')

    window.history.back()

    expect(await screen.findByRole('heading', { name: 'Produtor não encontrado' })).toBeInTheDocument()
  })

  it('should explain when a producer cannot be found', async () => {
    renderAt('/producers/00000000-0000-4000-8000-999999999999')
    expect(await screen.findByRole('heading', { name: 'Produtor não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para produtores' })).toHaveAttribute('href', '/producers')
  })
})
