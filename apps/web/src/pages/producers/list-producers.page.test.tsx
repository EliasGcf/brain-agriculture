import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'

import { ListProducersPage } from './list-producers.page'
import { makeProducer, mockData } from '../../../tests/mocks/data'
import { server } from '../../../tests/mocks/server'
import { renderWithProviders } from '../../../tests/test-utils'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const producersUrl = `${baseUrl}/producers`

function renderProducers() {
  window.history.replaceState({}, '', '/producers')
  return renderWithProviders(
    <MemoryRouter initialEntries={['/producers']}>
      <ListProducersPage />
    </MemoryRouter>,
  )
}

describe('producers page', () => {
  it('should be able to see the producers returned by the API', async () => {
    renderProducers()

    expect(await screen.findByText('Ada Rural')).toBeInTheDocument()
    expect(await screen.findByText('Bruno Rural')).toBeInTheDocument()
    expect(await screen.findByText('Cora Rural')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should be able to search producers by partial name', async () => {
    renderProducers()

    const search = screen.getByRole('textbox', { name: 'Nome do produtor' })
    await screen.findByText('Ada Rural')
    fireEvent.change(search, { target: { value: 'bruno' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Buscar produtores' }))

    expect(await screen.findByText('Bruno Rural')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Ada Rural')).not.toBeInTheDocument())
  })

  it('should be able to search producers by document', async () => {
    renderProducers()

    const search = screen.getByRole('textbox', { name: 'CPF ou CNPJ' })
    await screen.findByText('Ada Rural')
    fireEvent.change(search, { target: { value: '390.533.447-05' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Buscar produtores' }))

    expect(await screen.findByText('Bruno Rural')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Ada Rural')).not.toBeInTheDocument())
  })

  it('should be able to show an empty state for an empty API response', async () => {
    renderProducers()

    const search = screen.getByRole('textbox', { name: 'Nome do produtor' })
    await screen.findByText('Ada Rural')
    fireEvent.change(search, { target: { value: 'does not exist' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Buscar produtores' }))

    expect(await screen.findByText('Nenhum produtor encontrado')).toBeInTheDocument()
  })

  it('should be able to move through pages provided by the API', async () => {
    const records = [
      makeProducer({ id: '00000000-0000-4000-8000-000000000011', name: 'Page One Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000012', name: 'Page Two Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000013', name: 'Page Three Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000014', name: 'Page Four Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000015', name: 'Page Five Rural' }),
    ]
    server.use(
      http.get(producersUrl, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 1)
        const start = (page - 1) * 4
        return HttpResponse.json({
          items: records.slice(start, start + 4).map((item) => ({ ...item, farmsCount: 0 })),
          total: records.length,
        })
      }),
    )

    renderProducers()

    expect(await screen.findByText('Page One Rural')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))

    expect(await screen.findByText('Page Five Rural')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
  })

  it('should be able to keep the producer search and page in the URL', async () => {
    const records = [
      makeProducer({ id: '00000000-0000-4000-8000-000000000031', name: 'URL One Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000032', name: 'URL Two Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000033', name: 'URL Three Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000034', name: 'URL Four Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000035', name: 'URL Five Rural' }),
    ]
    server.use(
      http.get(producersUrl, ({ request }) => {
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const query = url.searchParams.get('name')
        const filtered = query ? records.filter((record) => record.name.includes(query)) : records
        const start = (page - 1) * 4
        return HttpResponse.json({
          items: filtered.slice(start, start + 4).map((item) => ({ ...item, farmsCount: 0 })),
          total: filtered.length,
        })
      }),
    )

    renderProducers()
    const nameSearch = screen.getByRole('textbox', { name: 'Nome do produtor' })
    const documentSearch = screen.getByRole('textbox', { name: 'CPF ou CNPJ' })
    fireEvent.change(nameSearch, { target: { value: 'URL' } })
    fireEvent.change(documentSearch, { target: { value: '529.982.247-25' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Buscar produtores' }))

    await waitFor(() => expect(window.location.search).toBe('?name=URL&document=529.982.247-25'))
    expect(await screen.findByText('URL One Rural')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))

    await waitFor(() => expect(window.location.search).toBe('?name=URL&document=529.982.247-25&page=2'))
    expect(await screen.findByText('URL Five Rural')).toBeInTheDocument()
  })

  it('should be able to return to the last valid page after deleting its sole row', async () => {
    const records = [
      makeProducer({ id: '00000000-0000-4000-8000-000000000021', name: 'Page Six Rural' }),
      makeProducer({ id: '00000000-0000-4000-8000-000000000022', name: 'Page Seven Rural' }),
    ]
    const requestedPages: number[] = []
    mockData.producers.push(...records)
    server.use(
      http.get(producersUrl, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 1)
        requestedPages.push(page)
        const start = (page - 1) * 4
        return HttpResponse.json({
          items: mockData.producers.slice(start, start + 4).map((item) => ({ ...item, farmsCount: 0 })),
          total: mockData.producers.length,
        })
      }),
    )

    renderProducers()

    fireEvent.click(await screen.findByRole('button', { name: 'Próxima página' }))
    expect(await screen.findByText('Page Seven Rural')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ações de Page Seven Rural' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))

    expect(await screen.findByText('Ada Rural')).toBeInTheDocument()
    expect(requestedPages).toContain(1)
    expect(screen.queryByText('Page Seven Rural')).not.toBeInTheDocument()
  })

  it('should be able to retry after the producer API fails', async () => {
    let attempts = 0
    server.use(
      http.get(producersUrl, () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json({ message: 'Temporary failure' }, { status: 500 })
          : HttpResponse.json({ items: mockData.producers.map((producer) => ({ ...producer, farmsCount: 0 })), total: 3 })
      }),
    )

    renderProducers()

    expect(await screen.findByText('Não foi possível carregar os produtores.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText('Ada Rural')).toBeInTheDocument()
  })

  it('should be able to remove a producer after the API confirms deletion', async () => {
    renderProducers()

    await screen.findByText('Cora Rural')
    fireEvent.click(screen.getByRole('button', { name: 'Ações de Cora Rural' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))

    await waitFor(() => expect(screen.queryByText('Cora Rural')).not.toBeInTheDocument())
  })

  it('should not be able to remove a producer when deletion is cancelled', async () => {
    renderProducers()

    await screen.findByText('Cora Rural')
    fireEvent.click(screen.getByRole('button', { name: 'Ações de Cora Rural' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByText('Cora Rural')).toBeInTheDocument()
  })

  it('should not remove a producer when the API rejects deletion', async () => {
    renderProducers()

    await screen.findByText('Ada Rural')
    fireEvent.click(screen.getByRole('button', { name: 'Ações de Ada Rural' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))

    expect(await screen.findByText('O produtor possui fazendas.')).toBeInTheDocument()
    expect(screen.queryByText(/Producer has farms/)).not.toBeInTheDocument()
    expect(screen.getByText('Ada Rural')).toBeInTheDocument()
  })

  it('should show a Portuguese fallback when deletion returns not found', async () => {
    server.use(
      http.delete(`${producersUrl}/00000000-0000-4000-8000-000000000006`, () =>
        HttpResponse.json({ message: 'Producer not found' }, { status: 404 })),
    )
    renderProducers()

    await screen.findByText('Cora Rural')
    fireEvent.click(screen.getByRole('button', { name: 'Ações de Cora Rural' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir produtor$/ }))

    expect(await screen.findByText('O produtor não foi encontrado.')).toBeInTheDocument()
    expect(screen.queryByText(/Producer not found/)).not.toBeInTheDocument()
    expect(screen.getByText('Cora Rural')).toBeInTheDocument()
  })
})
