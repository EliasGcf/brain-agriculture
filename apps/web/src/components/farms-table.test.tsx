import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FarmsTable } from './farms-table'
import { makeFarm } from '../../tests/mocks/data'

describe('farms table', () => {
  it('should display farm summaries in a table', () => {
    render(<FarmsTable farms={[makeFarm()]} />)

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
    render(<FarmsTable farms={[]} />)

    expect(screen.getByText('Nenhuma fazenda encontrada')).toBeInTheDocument()
    expect(screen.getByText('As fazendas cadastradas aparecerão nesta lista.')).toBeInTheDocument()
  })
})
