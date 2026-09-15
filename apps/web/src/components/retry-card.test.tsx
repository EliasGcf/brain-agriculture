import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RetryCard } from './retry-card'

describe('retry card', () => {
  it('should display the loading error and retry action', () => {
    const onRetry = vi.fn()

    render(
      <RetryCard
        title="Não foi possível carregar os produtores."
        description="Tente novamente para recarregar a listagem."
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os produtores.')
    expect(screen.getByText('Tente novamente para recarregar a listagem.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
