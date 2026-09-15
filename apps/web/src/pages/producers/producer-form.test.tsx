import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppRoutes } from '../../routes'

function renderCreateProducer() {
  window.history.pushState({}, '', '/produtores/novo')
  return render(<AppRoutes />)
}

describe('producer form', () => {
  it('should not be able to submit an invalid document', () => {
    renderCreateProducer()

    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), {
      target: { value: 'Novo Produtor' },
    })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), {
      target: { value: '11111111111' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))

    expect(screen.getByText('Informe um CPF ou CNPJ válido.')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/produtores/novo')
  })

  it('should not be able to submit a duplicate document', () => {
    renderCreateProducer()

    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), {
      target: { value: 'Outro Produtor' },
    })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), {
      target: { value: '11.222.333/0001-81' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))

    expect(screen.getByText('Este CPF ou CNPJ já está cadastrado.')).toBeInTheDocument()
  })

  it('should be able to create a producer and continue in its detail page', async () => {
    renderCreateProducer()

    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), {
      target: { value: 'Novo Produtor' },
    })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), {
      target: { value: '52998224725' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Novo Produtor' })).toBeInTheDocument()
    })
    expect(screen.getByText('Nenhuma fazenda cadastrada')).toBeInTheDocument()
  })
})
