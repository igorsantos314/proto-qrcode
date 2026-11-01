import { useRef } from 'react'
import type { QrBackground } from '../types'
import type { GeneratedConfig } from '../lib/qr/sameConfig'
import { buildQrFilename, downloadCanvas } from '../lib/qr/downloadPng'
import { QrCanvas } from './QrCanvas'
import styles from './QrPreview.module.css'

interface QrPreviewProps {
  generated: GeneratedConfig | null
  background: QrBackground
  logoDataUrl: string | null
  borderWidth: number
  borderRadius: number
  stale: boolean
  onBackgroundChange: (background: QrBackground) => void
  onBorderWidthChange: (borderWidth: number) => void
  onBorderRadiusChange: (borderRadius: number) => void
  onLogoSelect: (file: File) => void
  onLogoRemove: () => void
}

function parseDimension(value: string): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const QR_SIZE = 256
const QR_EXPORT_SIZE = 1000

const BACKGROUND_OPTIONS: Array<{ value: QrBackground; label: string }> = [
  { value: 'none', label: 'Sem fundo' },
  { value: 'white', label: 'Com fundo' },
]

export function QrPreview({
  generated,
  background,
  logoDataUrl,
  borderWidth,
  borderRadius,
  stale,
  onBackgroundChange,
  onBorderWidthChange,
  onBorderRadiusChange,
  onLogoSelect,
  onLogoRemove,
}: QrPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hasGenerated = generated !== null

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, buildQrFilename(), {
        borderWidth,
        borderRadius,
        cssSize: QR_SIZE,
        outputSize: QR_EXPORT_SIZE,
      })
    }
  }

  return (
    <section className={styles.preview} aria-label="Visualização do QR code">
      <h2 className={styles.heading}>Visualização</h2>

      <div className={styles.canvasWrap}>
        {hasGenerated ? (
          <QrCanvas
            ref={canvasRef}
            value={generated.payload}
            background={generated.background}
            logoDataUrl={generated.logoDataUrl}
            borderWidth={borderWidth}
            borderRadius={borderRadius}
            size={QR_SIZE}
            resolution={QR_EXPORT_SIZE}
          />
        ) : (
          <div className={styles.placeholder}>
            <p>Preencha os campos ao lado e clique em <strong>Gerar</strong>.</p>
          </div>
        )}
        {stale && (
          <p className={styles.stale}>
            Configuração alterada — clique em <strong>Gerar</strong> para atualizar o QR code.
          </p>
        )}
      </div>

      <div className={styles.controls}>
        <fieldset className={styles.backgroundGroup}>
          <legend className={styles.groupLabel}>Fundo</legend>
          <div className={styles.segmented} role="radiogroup" aria-label="Fundo do QR code">
            {BACKGROUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={background === option.value}
                className={
                  background === option.value ? styles.segmentActive : styles.segment
                }
                onClick={() => onBackgroundChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className={styles.shapeGroup}>
          <div className={styles.dimensionField}>
            <label htmlFor="qr-border" className={styles.groupLabel}>
              Borda (px)
            </label>
            <input
              id="qr-border"
              type="number"
              min={0}
              step={1}
              className={styles.numberInput}
              value={borderWidth}
              onChange={(event) =>
                onBorderWidthChange(parseDimension(event.target.value))
              }
            />
          </div>
          <div className={styles.dimensionField}>
            <label htmlFor="qr-radius" className={styles.groupLabel}>
              Raio dos cantos (px)
            </label>
            <input
              id="qr-radius"
              type="number"
              min={0}
              step={1}
              className={styles.numberInput}
              value={borderRadius}
              onChange={(event) =>
                onBorderRadiusChange(parseDimension(event.target.value))
              }
            />
          </div>
        </div>

        <div className={styles.logoGroup}>
          <span className={styles.groupLabel}>Logomarca (preto e branco)</span>
          <div className={styles.logoActions}>
            {logoDataUrl ? (
              <>
                <img
                  src={logoDataUrl}
                  alt="Logomarca selecionada"
                  className={styles.logoPreview}
                  width={40}
                  height={40}
                />
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={onLogoRemove}
                >
                  Remover
                </button>
              </>
            ) : (
              <label className={styles.uploadLabel}>
                Escolher imagem
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      onLogoSelect(file)
                    }
                    event.target.value = ''
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.download}
          disabled={!hasGenerated}
          onClick={handleDownload}
        >
          Baixar PNG
        </button>
      </div>
    </section>
  )
}