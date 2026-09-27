import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppBar } from './AppBar'

describe('AppBar', () => {
  it('renders the logo and the app name', () => {
    render(<AppBar />)
    expect(screen.getByRole('img', { name: 'Logo Proto Gestão' })).toBeInTheDocument()
    expect(screen.getByText('Proto QR Code')).toBeInTheDocument()
  })
})