export interface DownloadQrOptions {
  borderWidth?: number
  borderRadius?: number
  cssSize?: number
  outputSize?: number
}

export function buildQrFilename(): string {
  return `qrcode-${Date.now()}.png`
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function composeCanvas(
  canvas: HTMLCanvasElement,
  options: DownloadQrOptions,
): HTMLCanvasElement {
  const outputSize = Math.max(
    1,
    Math.round(options.outputSize ?? canvas.width),
  )
  const ratio =
    options.cssSize && options.cssSize > 0
      ? outputSize / options.cssSize
      : canvas.width > 0
        ? outputSize / canvas.width
        : 1
  const border = Math.max(0, Math.round((options.borderWidth ?? 0) * ratio))
  const radius = Math.max(0, Math.round((options.borderRadius ?? 0) * ratio))

  if (outputSize === canvas.width && border === 0 && radius === 0) {
    return canvas
  }

  const output = document.createElement('canvas')
  output.width = outputSize
  output.height = outputSize
  const ctx = output.getContext('2d')
  if (!ctx) {
    return canvas
  }

  const innerSize = Math.max(1, outputSize - border * 2)

  ctx.save()
  roundedRectPath(
    ctx,
    border,
    border,
    innerSize,
    innerSize,
    Math.max(0, radius - border),
  )
  ctx.clip()
  ctx.drawImage(canvas, border, border, innerSize, innerSize)
  ctx.restore()

  if (border > 0) {
    ctx.lineWidth = border
    ctx.strokeStyle = '#000000'
    roundedRectPath(
      ctx,
      border / 2,
      border / 2,
      outputSize - border,
      outputSize - border,
      Math.max(0, radius - border / 2),
    )
    ctx.stroke()
  }

  return output
}

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string = buildQrFilename(),
  options: DownloadQrOptions = {},
): void {
  const needsCompose =
    options.outputSize !== undefined ||
    (options.borderWidth ?? 0) > 0 ||
    (options.borderRadius ?? 0) > 0
  const exportCanvas = needsCompose ? composeCanvas(canvas, options) : canvas
  const url = exportCanvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
