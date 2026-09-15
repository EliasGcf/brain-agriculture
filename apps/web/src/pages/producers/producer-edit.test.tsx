import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppRoutes } from '../../routes'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<AppRoutes />)
}

describe('producer detail', () => {
  it('should be able to see an empty farms state and add-farm action', () => {
    renderAt('/produtores/producer-2')

    expect(screen.getByRole('heading', { name: 'Carlos Henrique Oliveira' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo ou razão social')).toHaveValue('Carlos Henrique Oliveira')
    expect(screen.getByText('CPF/CNPJ: 123.456.789-09')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma fazenda cadastrada')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar fazenda' }))

    expect(screen.getByRole('button', { name: 'Salvar fazenda' })).toBeInTheDocument()
  })

  it('should be able to save an inline farm and see it in the producer detail', () => {
    renderAt('/produtores/producer-2')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar fazenda' }))

    fireEvent.change(screen.getByLabelText('Nome da fazenda'), { target: { value: 'Fazenda Nova' } })
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Barreiras' } })
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'ba' } })
    fireEvent.change(screen.getByLabelText('Área total (ha)'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Área agricultável (ha)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Área de vegetação (ha)'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    expect(screen.getByText('Fazenda Nova')).toBeInTheDocument()
    expect(screen.getByText('Barreiras, BA')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salvar fazenda' })).not.toBeInTheDocument()
  })

  it('should not be able to delete a producer that owns farms', () => {
    renderAt('/produtores/producer-1')

    expect(screen.getByRole('button', { name: 'Excluir produtor' })).toBeDisabled()
  })

  it('should be able to edit producer data and remain on the detail page', async () => {
    renderAt('/produtores/producer-2')

    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), {
      target: { value: 'Carlos Henrique Atualizado' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Carlos Henrique Atualizado' })).toBeInTheDocument()
    })
    expect(window.location.pathname).toBe('/produtores/producer-2')
  })

  it('should be able to explain when a producer does not exist', () => {
    renderAt('/produtores/unknown')

    expect(screen.getByRole('heading', { name: 'Produtor não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para produtores' })).toHaveAttribute('href', '/produtores')
  })
})
