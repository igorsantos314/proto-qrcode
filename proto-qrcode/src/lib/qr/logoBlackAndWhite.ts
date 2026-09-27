export const LOGO_MAX_SIZE = 128

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível carregar a imagem selecionada.'))
    }
    image.src = url
  })
}

export async function convertLogoToBlackAndWhite(
  file: File,
  maxSize: number = LOGO_MAX_SIZE,
): Promise<string> {
  const image = await loadImage(file)
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight))
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D não está disponível neste navegador.')
  }

  context.filter = 'grayscale(100%) contrast(1.2)'
  context.drawImage(image, 0, 0, width, height)
  context.filter = 'none'
  return canvas.toDataURL('image/png')
}