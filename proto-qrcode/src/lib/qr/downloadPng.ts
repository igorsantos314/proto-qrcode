export function buildQrFilename(): string {
  return `qrcode-${Date.now()}.png`
}

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string = buildQrFilename(),
): void {
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}