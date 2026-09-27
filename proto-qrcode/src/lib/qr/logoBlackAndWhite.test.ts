import { afterEach, describe, expect, it, vi } from 'vitest'
import { convertLogoToBlackAndWhite } from './logoBlackAndWhite'

interface FakeContext {
  filterHistory: string[]
  drawImage: ReturnType<typeof vi.fn>
}

const fakeContext: FakeContext = {
  filterHistory: [],
  drawImage: vi.fn(),
}

Object.defineProperty(fakeContext, 'filter', {
  get: () => fakeContext.filterHistory.at(-1) ?? '',
  set: (value: string) => {
    fakeContext.filterHistory.push(value)
  },
  configurable: true,
})

function installCanvasMock(dataUrl: string): void {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:fake'),
    revokeObjectURL: vi.fn(),
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => fakeContext as unknown as CanvasRenderingContext2D,
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => dataUrl)
}

function installImageMock(sourceWidth: number, sourceHeight: number): void {
  class FakeImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src = ''
    naturalWidth = sourceWidth
    naturalHeight = sourceHeight
    width = sourceWidth
    height = sourceHeight
    constructor() {
      queueMicrotask(() => this.onload?.())
    }
  }
  vi.stubGlobal('Image', FakeImage)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('convertLogoToBlackAndWhite', () => {
  it('returns a PNG data URL with a grayscale filter applied', async () => {
    installImageMock(400, 400)
    installCanvasMock('data:image/png;base64,AAAA')
    const file = new File(['x'], 'logo.png', { type: 'image/png' })

    const result = await convertLogoToBlackAndWhite(file)

    expect(result).toBe('data:image/png;base64,AAAA')
    expect(fakeContext.filterHistory).toContain('grayscale(100%) contrast(1.2)')
    expect(fakeContext.drawImage).toHaveBeenCalled()
  })

  it('downscales a large source to the max size', async () => {
    installImageMock(2000, 1000)
    installCanvasMock('data:image/png;base64,BBBB')
    const file = new File(['x'], 'logo.png', { type: 'image/png' })

    await convertLogoToBlackAndWhite(file, 128)

    expect(fakeContext.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      128,
      64,
    )
  })

  it('does not upscale small images', async () => {
    installImageMock(50, 50)
    installCanvasMock('data:image/png;base64,CCCC')
    const file = new File(['x'], 'logo.png', { type: 'image/png' })

    await convertLogoToBlackAndWhite(file, 128)

    expect(fakeContext.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      50,
      50,
    )
  })

  it('throws when canvas 2d context is unavailable', async () => {
    installImageMock(100, 100)
    installCanvasMock('data:image/png;base64,DDDD')
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const file = new File(['x'], 'logo.png', { type: 'image/png' })

    await expect(convertLogoToBlackAndWhite(file)).rejects.toThrow(
      /Canvas 2D/,
    )
  })
})