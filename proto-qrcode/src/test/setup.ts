import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'
import { afterEach, vi } from 'vitest'

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => `test-${Math.random().toString(36).slice(2)}`,
    configurable: true,
  })
}

vi.mock('qrcode.react', () => ({
  QRCodeCanvas: React.forwardRef<
    HTMLCanvasElement,
    Record<string, unknown> & { imageSettings?: unknown }
  >((props, ref) =>
    React.createElement('canvas', {
      ref,
      'data-testid': 'qr-canvas',
      'data-value': String(props.value ?? ''),
      'data-bgcolor': String(props.bgColor ?? ''),
      'data-imagesettings': props.imageSettings
        ? JSON.stringify(props.imageSettings)
        : '',
    }),
  ),
}))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})