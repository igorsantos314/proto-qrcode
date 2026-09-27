import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const JSQR_SOURCE = readFileSync(
  resolve(__dirname, '../node_modules/jsqr/dist/jsQR.js'),
  'utf8',
)

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

async function generateText(page: Page, text: string) {
  await page.getByLabel('Conteúdo do QR code').fill(text)
  await page.getByRole('button', { name: 'Gerar' }).click()
}

async function saveCurrent(page: Page) {
  await page.getByRole('button', { name: /salvar/i }).click()
  const dialog = page.getByRole('dialog', { name: 'QR code salvo' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('limpar o cache do navegador')
  await dialog.getByRole('button', { name: 'Entendi' }).click()
}

async function decodeQr(page: Page): Promise<string | null> {
  await page.addScriptTag({ content: JSQR_SOURCE })
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const composite = document.createElement('canvas')
    composite.width = canvas.width
    composite.height = canvas.height
    const cctx = composite.getContext('2d')
    if (!cctx) return null
    cctx.fillStyle = '#ffffff'
    cctx.fillRect(0, 0, composite.width, composite.height)
    cctx.drawImage(canvas, 0, 0)
    const imageData = cctx.getImageData(0, 0, composite.width, composite.height)
    const jsQR = (
      window as unknown as {
        jsQR?: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null
      }
    ).jsQR
    if (!jsQR) return null
    const result = jsQR(imageData.data, imageData.width, imageData.height)
    return result ? result.data : null
  })
}

async function cornerAlpha(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return -1
    const ctx = canvas.getContext('2d')
    if (!ctx) return -1
    const pixel = ctx.getImageData(0, 0, 1, 1)
    return pixel.data[3]
  })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test.describe('7.1 – each tab generates a QR canvas', () => {
  test('text tab', async ({ page }) => {
    await generateText(page, 'Olá, Proto QR Code')
    await expect(page.locator('canvas')).toBeVisible()
    await saveCurrent(page)
    await expect(page.getByText('1 no total')).toBeVisible()
  })

  test('wifi tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'WiFi' }).click()
    await page.getByLabel('Nome da rede (SSID)').fill('MinhaRede')
    await page.getByLabel('Senha').fill('segredo')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('instagram tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Instagram' }).click()
    await page.getByLabel('Usuário do Instagram').fill('meuperfil')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('facebook tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Facebook' }).click()
    await page.getByLabel('Página ou perfil do Facebook').fill('minhapagina')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('pix tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Pix' }).click()
    await page.getByLabel('Chave Pix').fill('+5511999999999')
    await page.getByLabel('Nome do recebedor').fill('Fulano de Tal')
    await page.getByLabel('Cidade').fill('SAO PAULO')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
  })
})

test.describe('7.2 – the decoded QR matches the configured payload', () => {
  test('text', async ({ page }) => {
    await generateText(page, 'Olá, Proto QR Code!')
    await expect(page.locator('canvas')).toBeVisible()
    expect(await decodeQr(page)).toBe('Olá, Proto QR Code!')
  })

  test('wifi', async ({ page }) => {
    await page.getByRole('tab', { name: 'WiFi' }).click()
    await page.getByLabel('Nome da rede (SSID)').fill('CasaWiFi')
    await page.getByLabel('Senha').fill('12345678')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
    expect(await decodeQr(page)).toBe(
      'WIFI:T:WPA;S:CasaWiFi;P:12345678;H:false;;',
    )
  })

  test('instagram', async ({ page }) => {
    await page.getByRole('tab', { name: 'Instagram' }).click()
    await page.getByLabel('Usuário do Instagram').fill('meuperfil')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
    expect(await decodeQr(page)).toBe('https://www.instagram.com/meuperfil')
  })

  test('facebook', async ({ page }) => {
    await page.getByRole('tab', { name: 'Facebook' }).click()
    await page.getByLabel('Página ou perfil do Facebook').fill('minhapagina')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()
    expect(await decodeQr(page)).toBe('https://facebook.com/minhapagina')
  })

  test('pix', async ({ page }) => {
    await page.getByRole('tab', { name: 'Pix' }).click()
    await page.getByLabel('Chave Pix').fill('+5511999999999')
    await page.getByLabel('Nome do recebedor').fill('Fulano de Tal')
    await page.getByLabel('Cidade').fill('SAO PAULO')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await expect(page.locator('canvas')).toBeVisible()

    const decoded = await decodeQr(page)
    expect(decoded).toBeTruthy()
    expect(decoded).toMatch(/^000201/)
    expect(decoded).toContain('br.gov.bcb.pix')
    expect(decoded).toContain('+5511999999999')
    expect(decoded).toContain('Fulano de Tal')
  })
})

test.describe('7.3 – download with and without background', () => {
  test('default (no background) PNG is transparent', async ({ page }) => {
    await generateText(page, 'Baixar sem fundo')
    await expect(page.locator('canvas')).toBeVisible()
    expect(await cornerAlpha(page)).toBe(0)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Baixar PNG' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^qrcode-\d+\.png$/)
    const path = await download.path()
    const bytes = readFileSync(path!)
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE)
  })

  test('with background PNG is not transparent', async ({ page }) => {
    await page.getByRole('radio', { name: 'Com fundo' }).click()
    await generateText(page, 'Baixar com fundo')
    await expect(page.locator('canvas')).toBeVisible()
    expect(await cornerAlpha(page)).toBe(255)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Baixar PNG' }).click(),
    ])
    const path = await download.path()
    const bytes = readFileSync(path!)
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE)
  })
})

test.describe('8.3 – browser verification', () => {
  test('footer shows attribution and links to Proto Gestão', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: 'Proto Gestão' })
    await expect(link).toHaveAttribute('href', 'https://protogestao.com')
    await expect(
      page.getByText(/Essa aplicação é mais uma solução do Proto Gestão/),
    ).toBeVisible()
    await expect(page.getByText(/Todos os direitos reservados/)).toBeVisible()
  })

  test('uploads a logo that appears embedded in the generated QR', async ({
    page,
  }) => {
    await page.getByLabel('Escolher imagem').setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8AARMAgYGBg+A8A+QABJwIA2gAAAABJRU5ErkJggg==',
        'base64',
      ),
    })
    await expect(
      page.getByRole('img', { name: 'Logomarca selecionada' }),
    ).toBeVisible()
    await generateText(page, 'QR com logomarca')
    await expect(page.locator('canvas')).toBeVisible()
  })
})

test.describe('7.4 – saved list lifecycle', () => {
  test('generates newest-first, edits in place, and deletes', async ({ page }) => {
    await generateText(page, 'primeiro')
    await saveCurrent(page)
    await generateText(page, 'segundo')
    await saveCurrent(page)

    await expect(page.getByText('2 no total')).toBeVisible()
    const items = page.locator('ul > li')
    await expect(items).toHaveCount(2)
    await expect(items.first()).toContainText('segundo')
    await expect(items.nth(1)).toContainText('primeiro')

    await items.first().getByRole('button', { name: 'Editar' }).click()
    const textarea = page.getByLabel('Conteúdo do QR code')
    await expect(textarea).toHaveValue('segundo')
    await expect(page.getByText('Editando')).toBeVisible()
    await textarea.fill('segundo editado')
    await page.getByRole('button', { name: 'Gerar' }).click()
    await saveCurrent(page)

    await expect(page.getByText('2 no total')).toBeVisible()
    const afterEdit = page.locator('ul > li')
    await expect(afterEdit.first()).toContainText('segundo editado')
    await expect(afterEdit).toHaveCount(2)

    await afterEdit.first().getByRole('button', { name: 'Excluir' }).click()
    const deleteDialog = page.getByRole('dialog', { name: 'Excluir QR code?' })
    await expect(deleteDialog).toBeVisible()
    await deleteDialog.getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('1 no total')).toBeVisible()
    await expect(page.locator('ul > li')).toHaveCount(1)
    await expect(page.locator('ul > li').first()).toContainText('primeiro')
  })

  test('round-trips a saved record back into the form after reload', async ({ page }) => {
    await page.getByRole('radio', { name: 'Com fundo' }).click()
    await generateText(page, 'persistido')
    await saveCurrent(page)

    await page.reload()
    await expect(page.getByText('1 no total')).toBeVisible()
    await page.locator('ul > li').first().getByRole('button', { name: 'Editar' }).click()
    await expect(page.getByLabel('Conteúdo do QR code')).toHaveValue('persistido')
    await expect(page.getByRole('radio', { name: 'Com fundo' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})