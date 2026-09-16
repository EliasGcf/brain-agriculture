import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../tests/test-utils'
import { ProducerFarmsSection } from './producer-farms-section'

const ADA_ID = '00000000-0000-4000-8000-000000000001'

describe('producer farms section', () => {
  it('should display farms belonging to the producer', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProducerFarmsSection producerId={ADA_ID} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('cell', { name: 'Green Acres' })).toBeInTheDocument()
    expect(screen.getByText('Fazendas vinculadas a este produtor.')).toBeInTheDocument()
  })
})
