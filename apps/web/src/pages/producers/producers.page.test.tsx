import { fireEvent, render, screen } from '@testing-library/react'

import { AppRoutes } from '../../routes'

function renderProducers() {
  window.history.pushState({}, '', '/produtores')
  return render(<AppRoutes />)
}

describe('producers page', () => {
  it('should be able to see the registered producers', () => {
    renderProducers()

    expect(screen.getByRole('heading', { name: 'Produtores' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Busque por nome ou CPF/CNPJ.')).toBeInTheDocument()
    expect(screen.getByText('Agropecuária Boa Safra')).toBeInTheDocument()
    expect(screen.getByText('11.222.333/0001-81')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Fazendas' })).toBeInTheDocument()
    expect(screen.getByText('Carlos Henrique Oliveira')).toBeInTheDocument()
  })

  it('should be able to search producers by partial name or document', () => {
    renderProducers()

    const search = screen.getByRole('textbox', { name: 'Buscar produtor' })

    fireEvent.change(search, { target: { value: 'cooperativa' } })
    expect(screen.getByText('Cooperativa Vale Verde')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Henrique Oliveira')).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: '74185296300' } })
    expect(screen.getByText('Grupo Campo Forte')).toBeInTheDocument()
    expect(screen.queryByText('Cooperativa Vale Verde')).not.toBeInTheDocument()
  })

  it('should be able to see an empty state when no producer matches the search', () => {
    renderProducers()

    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar produtor' }), {
      target: { value: 'não existe' },
    })

    expect(screen.getByText('Nenhum produtor encontrado')).toBeInTheDocument()
  })

  it('should be able to move through producer pages', () => {
    renderProducers()

    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
    expect(screen.queryByText('Grupo Campo Forte')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))

    expect(screen.getByText('Grupo Campo Forte')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
  })

  it('should be able to start adding a producer', () => {
    renderProducers()

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar produtor' }))

    expect(screen.getByRole('heading', { name: 'Novo produtor', level: 1 })).toBeInTheDocument()
  })

  it('should be able to remove a producer without farms after confirmation', () => {
    window.confirm = () => true
    renderProducers()

    fireEvent.click(screen.getByRole('button', { name: 'Ações de Carlos Henrique Oliveira' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }))

    expect(screen.queryByText('Carlos Henrique Oliveira')).not.toBeInTheDocument()
  })

  it('should not offer a producer details action', () => {
    renderProducers()

    fireEvent.click(screen.getByRole('button', { name: 'Ações de Carlos Henrique Oliveira' }))

    expect(screen.queryByRole('menuitem', { name: 'Ver detalhes' })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument()
  })
})
