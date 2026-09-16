import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'

import { FarmsTable } from './farms-table'
import { makeFarm } from '../../tests/mocks/data'

describe('farms table', () => {
  it('should display farm summaries in a table', () => {
    render(
      <MemoryRouter>
        <FarmsTable farms={[makeFarm()]} onDeleteSuccess={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Localização' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Área total' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Agricultável' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Vegetação' })).toBeInTheDocument()
    expect(screen.getByText('Green Acres')).toBeInTheDocument()
    expect(screen.getByText('Salvador, BA')).toBeInTheDocument()
    expect(screen.getByText('100 ha')).toBeInTheDocument()
    expect(screen.getByText('60 ha')).toBeInTheDocument()
    expect(screen.getByText('20 ha')).toBeInTheDocument()
  })

  it('should display an empty state when there are no farms', () => {
    render(<FarmsTable farms={[]} onDeleteSuccess={vi.fn()} />)

    expect(screen.getByText('Nenhuma fazenda encontrada')).toBeInTheDocument()
    expect(screen.getByText('As fazendas cadastradas aparecerão nesta lista.')).toBeInTheDocument()
  })

  it('should provide edit and delete actions for a farm', () => {
    const farm = makeFarm()

    render(
      <MemoryRouter>
        <FarmsTable farms={[farm]} onDeleteSuccess={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: farm.name })).toHaveAttribute(
      'href',
      `/farms/${farm.id}`,
    )
    fireEvent.click(screen.getByRole('button', { name: `Ações de ${farm.name}` }))

    expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Excluir' })).toBeInTheDocument()
  })
})
