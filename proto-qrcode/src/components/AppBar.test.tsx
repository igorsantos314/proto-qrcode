import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppBar } from './AppBar'

function renderAppBar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppBar />
    </MemoryRouter>,
  )
}

describe('AppBar', () => {
  it('renders the logo and the LaserGest name', () => {
    renderAppBar()
    expect(screen.getByRole('img', { name: 'Logo LaserGest' })).toBeInTheDocument()
    expect(screen.getByText('LaserGest')).toBeInTheDocument()
  })

  it('exposes navigation to QR Code and Orçamentos', () => {
    renderAppBar()
    expect(screen.getByRole('link', { name: 'QR Code' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Orçamentos' })).toHaveAttribute(
      'href',
      '/orcamentos',
    )
  })

  it('marks the current section as active', () => {
    renderAppBar('/orcamentos')
    expect(
      screen.getByRole('link', { name: 'Orçamentos' }).className,
    ).toContain('navLinkActive')
    expect(
      screen.getByRole('link', { name: 'QR Code' }).className,
    ).not.toContain('navLinkActive')
  })
})
