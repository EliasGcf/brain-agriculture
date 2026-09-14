import { render, screen } from '@testing-library/react'

import { App } from './App'

describe('App', () => {
  it('should be able to display the application greeting', () => {
    render(<App />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  it('should be able to display the application greeting in an isolated test', () => {
    render(<App />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })
})
