import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/Todos os direitos reservados/)).toBeInTheDocument()
  })

  it('renders the Proto Gestão attribution text', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer.textContent).toContain(
      'Essa aplicação é mais uma solução do Proto Gestão.',
    )
  })

  it('links to https://protogestao.com', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Proto Gestão' })
    expect(link).toHaveAttribute('href', 'https://protogestao.com')
  })
})