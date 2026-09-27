import { useState } from 'react'
import { AppBar } from './components/AppBar'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Footer } from './components/Footer'
import { PayloadTabs } from './components/PayloadTabs'
import { QrPreview } from './components/QrPreview'
import { SavedList } from './components/SavedList'
import { CheckIcon, SaveIcon, TrashIcon } from './components/icons'
import {
  FacebookFields,
  InstagramFields,
  PixFields,
  TextFields,
  WifiFields,
} from './components/fields/Fields'
import { buildPayload } from './lib/payloads'
import type { PayloadFields, QrPayloadType } from './lib/payloads/types'
import { validatePayload } from './lib/payloads/validation'
import type { GeneratedConfig } from './lib/qr/sameConfig'
import { isStale } from './lib/qr/sameConfig'
import { convertLogoToBlackAndWhite } from './lib/qr/logoBlackAndWhite'
import { useSavedQrcodesContext } from './hooks/useSavedQrcodesContext'
import { SavedQrcodesProvider } from './state/SavedQrcodesProvider'
import type { QrBackground, SavedQrCode, SavedQrCodeInput } from './types'
import './App.css'

type DialogState =
  | { kind: 'save' }
  | { kind: 'delete'; record: SavedQrCode }
  | null

function Generator() {
  const saved = useSavedQrcodesContext()
  const [activeTab, setActiveTab] = useState<QrPayloadType>('text')
  const [fieldsByType, setFieldsByType] = useState<
    Record<QrPayloadType, PayloadFields>
  >({
    text: {},
    pix: {},
    instagram: {},
    wifi: {},
    facebook: {},
  })
  const [background, setBackground] = useState<QrBackground>('none')
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [generated, setGenerated] = useState<GeneratedConfig | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [dialog, setDialog] = useState<DialogState>(null)

  const fields = fieldsByType[activeTab]
  const setFields = (patch: PayloadFields) => {
    setFieldsByType((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...patch },
    }))
  }

  const payload = buildPayload(activeTab, fields)
  const currentConfig: GeneratedConfig = { payload, background, logoDataUrl }
  const stale = isStale(currentConfig, generated)

  const handleGenerate = () => {
    const validationErrors = validatePayload(activeTab, fields)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setGenerated({ payload, background, logoDataUrl })
  }

  const handleSave = () => {
    const validationErrors = validatePayload(activeTab, fields)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])

    const recordInput: SavedQrCodeInput = {
      type: activeTab,
      fields: { ...fields },
      payload,
      background,
      logoDataUrl,
    }
    if (saved.editingId) {
      saved.updateRecord(saved.editingId, recordInput)
      saved.clearEditing()
    } else {
      saved.createRecord(recordInput)
    }
    setDialog({ kind: 'save' })
  }

  const handleEdit = (record: SavedQrCode) => {
    setActiveTab(record.type)
    setFieldsByType((prev) => ({
      ...prev,
      [record.type]: { ...record.fields },
    }))
    setBackground(record.background)
    setLogoDataUrl(record.logoDataUrl)
    setGenerated({
      payload: record.payload,
      background: record.background,
      logoDataUrl: record.logoDataUrl,
    })
    saved.startEditing(record.id)
    setErrors([])
  }

  const handleDelete = (record: SavedQrCode) => {
    setDialog({ kind: 'delete', record })
  }

  const handleDialogConfirm = () => {
    if (dialog?.kind === 'delete') {
      saved.removeRecord(dialog.record.id)
      if (saved.editingId === dialog.record.id) {
        saved.clearEditing()
      }
    }
    setDialog(null)
  }

  const handleLogoSelect = async (file: File) => {
    try {
      const dataUrl = await convertLogoToBlackAndWhite(file)
      setLogoDataUrl(dataUrl)
    } catch {
      setErrors(['Não foi possível processar a logomarca selecionada.'])
    }
  }

  return (
    <main className="main">
      <div className="generator">
        <section className="form" aria-label="Gerador de QR code">
          <h1 className="formTitle">Gerar QR code</h1>
          <PayloadTabs active={activeTab} onChange={setActiveTab} />
          {errors.length > 0 && (
            <ul className="errors">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          {activeTab === 'text' && (
            <TextFields fields={fields} onChange={setFields} />
          )}
          {activeTab === 'pix' && (
            <PixFields fields={fields} onChange={setFields} />
          )}
          {activeTab === 'instagram' && (
            <InstagramFields fields={fields} onChange={setFields} />
          )}
          {activeTab === 'wifi' && (
            <WifiFields fields={fields} onChange={setFields} />
          )}
          {activeTab === 'facebook' && (
            <FacebookFields fields={fields} onChange={setFields} />
          )}
          {activeTab !== 'text' && (
            <div className="payloadPreview">
              <span className="payloadPreviewLabel">
                Conteúdo do QR code (prévia)
              </span>
              <code
                className={
                  payload
                    ? 'payloadPreviewText'
                    : 'payloadPreviewText payloadPreviewEmpty'
                }
              >
                {payload || 'Preencha os campos para visualizar o conteúdo.'}
              </code>
            </div>
          )}
          <div className="formActions">
            <button
              type="button"
              className="generateButton"
              onClick={handleGenerate}
            >
              Gerar
            </button>
            <button type="button" className="saveButton" onClick={handleSave}>
              <SaveIcon />
              Salvar
            </button>
          </div>
        </section>

        <QrPreview
          generated={generated}
          background={background}
          logoDataUrl={logoDataUrl}
          stale={stale}
          onBackgroundChange={setBackground}
          onLogoSelect={handleLogoSelect}
          onLogoRemove={() => setLogoDataUrl(null)}
        />
      </div>

      <SavedList
        records={saved.pageRecords}
        total={saved.records.length}
        page={saved.page}
        pageCount={saved.pageCount}
        editingId={saved.editingId}
        storageError={saved.storageError}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={saved.setPage}
      />

      <ConfirmDialog
        open={dialog !== null}
        variant={dialog?.kind === 'delete' ? 'danger' : 'success'}
        icon={dialog?.kind === 'delete' ? <TrashIcon size={20} /> : <CheckIcon size={20} />}
        title={dialog?.kind === 'delete' ? 'Excluir QR code?' : 'QR code salvo'}
        description={
          dialog?.kind === 'delete'
            ? 'Este QR code salvo será removido permanentemente. Essa ação não pode ser desfeita.'
            : 'O conteúdo foi salvo localmente neste navegador. Ao limpar o cache do navegador, todos os QR codes salvos serão perdidos.'
        }
        confirmLabel={dialog?.kind === 'delete' ? 'Excluir' : 'Entendi'}
        cancelLabel="Cancelar"
        showCancel={dialog?.kind === 'delete'}
        onConfirm={handleDialogConfirm}
        onClose={() => setDialog(null)}
      />
    </main>
  )
}

export default function App() {
  return (
    <SavedQrcodesProvider>
      <div className="app">
        <AppBar />
        <Generator />
        <Footer />
      </div>
    </SavedQrcodesProvider>
  )
}