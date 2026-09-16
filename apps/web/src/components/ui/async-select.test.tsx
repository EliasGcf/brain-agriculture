import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AsyncSelect } from './async-select'

type Producer = {
  id: string
  name: string
}

const originalResizeObserver = globalThis.ResizeObserver

beforeEach(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver
})

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver
})

describe('async select', () => {
  it('should be able to resolve a prefilled value without using it as a search query', async () => {
    const fetcherOptions = vi.fn<(query?: string) => Promise<Producer[]>>().mockResolvedValue([])
    const fetcherOption = vi.fn<(id: string) => Promise<Producer | null>>().mockResolvedValue({
      id: 'producer-1',
      name: 'Ada Rural',
    })

    render(
      <AsyncSelect
        fetcherOptions={fetcherOptions}
        fetcherOption={fetcherOption}
        value="producer-1"
        onChange={vi.fn()}
        label="Produtor"
        renderOption={(producer) => <span>{producer.name}</span>}
        getOptionValue={(producer) => producer.id}
        getDisplayValue={(producer) => producer.name}
      />,
    )

    expect(await screen.findByRole('combobox', { name: 'Produtor' })).toHaveTextContent('Ada Rural')
    expect(screen.getByText('Ada Rural')).toHaveClass('min-w-0', 'flex-1', 'truncate')
    await waitFor(() => expect(fetcherOption).toHaveBeenCalledWith('producer-1'))
    expect(fetcherOptions).not.toHaveBeenCalledWith('producer-1')
  })

  it('should not replace current options when an older search resolves later', async () => {
    const pendingSearches = new Map<string, (options: Producer[]) => void>()
    const fetcherOptions = vi.fn<(query?: string) => Promise<Producer[]>>((query) => {
      if (!query) return Promise.resolve([])
      return new Promise((resolve) => pendingSearches.set(query, resolve))
    })

    render(
      <AsyncSelect
        fetcherOptions={fetcherOptions}
        value=""
        onChange={vi.fn()}
        label="Produtor"
        renderOption={(producer) => <span>{producer.name}</span>}
        getOptionValue={(producer) => producer.id}
        getDisplayValue={(producer) => producer.name}
      />,
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Produtor' }))
    const searchInput = screen.getByPlaceholderText('Search produtor...')
    fireEvent.change(searchInput, { target: { value: 'first' } })
    await act(async () => new Promise((resolve) => setTimeout(resolve, 350)))
    await waitFor(() => expect(fetcherOptions).toHaveBeenCalledWith('first'))
    fireEvent.change(searchInput, { target: { value: 'second' } })
    await act(async () => new Promise((resolve) => setTimeout(resolve, 350)))
    await waitFor(() => expect(fetcherOptions).toHaveBeenCalledWith('second'))

    await act(async () => {
      pendingSearches.get('second')?.([{ id: 'second', name: 'Second result' }])
    })
    await act(async () => {
      pendingSearches.get('first')?.([{ id: 'first', name: 'First result' }])
    })

    expect(await screen.findByText('Second result')).toBeInTheDocument()
    expect(screen.queryByText('First result')).not.toBeInTheDocument()
  })
})
