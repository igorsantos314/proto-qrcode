import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildQrFilename, downloadCanvas } from './downloadPng'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('downloadPng', () => {
  it('exports the canvas as a PNG using the default qrcode-<timestamp>.png filename', () => {
    const toDataURL = vi.fn(() => 'data:image/png;base64,AAA')
    const canvas = { toDataURL } as unknown as HTMLCanvasElement
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    downloadCanvas(canvas)

    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(click).toHaveBeenCalledTimes(1)
    const link = click.mock.instances[0] as HTMLAnchorElement
    expect(link.href).toBe('data:image/png;base64,AAA')
    expect(link.download).toMatch(/^qrcode-\d+\.png$/)
  })

  it('uses a custom filename when provided', () => {
    const canvas = {
      toDataURL: () => 'data:image/png;base64,BBB',
    } as unknown as HTMLCanvasElement
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    downloadCanvas(canvas, 'meu-qrcode.png')

    const link = click.mock.instances[0] as HTMLAnchorElement
    expect(link.download).toBe('meu-qrcode.png')
  })

  it('builds a timestamped filename', () => {
    expect(buildQrFilename()).toMatch(/^qrcode-\d+\.png$/)
  })
})