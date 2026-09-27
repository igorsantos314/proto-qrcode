import type { PayloadFields } from '../../lib/payloads/types'
import { FACEBOOK_FIELD } from '../../lib/payloads/facebook'
import { INSTAGRAM_FIELD } from '../../lib/payloads/instagram'
import { PIX_FIELDS } from '../../lib/payloads/pix'
import { TEXT_FIELD } from '../../lib/payloads/text'
import {
  WIFI_ENCRYPTIONS,
  WIFI_FIELDS,
} from '../../lib/payloads/wifi'
import styles from './fields.module.css'

interface FieldsProps {
  fields: PayloadFields
  onChange: (patch: PayloadFields) => void
}

function asString(fields: PayloadFields, key: string): string {
  const value = fields[key]
  return typeof value === 'string' ? value : ''
}

function asBoolean(fields: PayloadFields, key: string): boolean {
  return fields[key] === true
}

interface TextFieldProps {
  id: string
  label: string
  value: string
  placeholder?: string
  optional?: boolean
  onValue: (value: string) => void
}

function TextField({
  id,
  label,
  value,
  placeholder,
  optional,
  onValue,
}: TextFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}>(opcional)</span>}
      </label>
      <input
        id={id}
        className={styles.input}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValue(event.target.value)}
      />
    </div>
  )
}

export function TextFields({ fields, onChange }: FieldsProps) {
  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label htmlFor="text-content" className={styles.label}>
          Conteúdo do QR code
        </label>
        <textarea
          id="text-content"
          className={styles.textarea}
          rows={4}
          placeholder="Digite o texto que será codificado no QR code"
          value={asString(fields, TEXT_FIELD)}
          onChange={(event) => onChange({ [TEXT_FIELD]: event.target.value })}
        />
      </div>
    </div>
  )
}

export function PixFields({ fields, onChange }: FieldsProps) {
  return (
    <div className={styles.fields}>
      <TextField
        id="pix-key"
        label="Chave Pix"
        placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
        value={asString(fields, PIX_FIELDS.key)}
        onValue={(value) => onChange({ [PIX_FIELDS.key]: value })}
      />
      <TextField
        id="pix-name"
        label="Nome do recebedor"
        value={asString(fields, PIX_FIELDS.name)}
        onValue={(value) => onChange({ [PIX_FIELDS.name]: value })}
      />
      <TextField
        id="pix-city"
        label="Cidade"
        value={asString(fields, PIX_FIELDS.city)}
        onValue={(value) => onChange({ [PIX_FIELDS.city]: value })}
      />
      <TextField
        id="pix-amount"
        label="Valor"
        placeholder="Ex.: 25,00"
        optional
        value={asString(fields, PIX_FIELDS.amount)}
        onValue={(value) => onChange({ [PIX_FIELDS.amount]: value })}
      />
      <TextField
        id="pix-description"
        label="Descrição"
        optional
        value={asString(fields, PIX_FIELDS.description)}
        onValue={(value) => onChange({ [PIX_FIELDS.description]: value })}
      />
    </div>
  )
}

export function InstagramFields({ fields, onChange }: FieldsProps) {
  return (
    <div className={styles.fields}>
      <TextField
        id="instagram-handle"
        label="Usuário do Instagram"
        placeholder="Ex.: @meuperfil"
        value={asString(fields, INSTAGRAM_FIELD)}
        onValue={(value) => onChange({ [INSTAGRAM_FIELD]: value })}
      />
    </div>
  )
}

export function WifiFields({ fields, onChange }: FieldsProps) {
  return (
    <div className={styles.fields}>
      <TextField
        id="wifi-ssid"
        label="Nome da rede (SSID)"
        value={asString(fields, WIFI_FIELDS.ssid)}
        onValue={(value) => onChange({ [WIFI_FIELDS.ssid]: value })}
      />
      <TextField
        id="wifi-password"
        label="Senha"
        value={asString(fields, WIFI_FIELDS.password)}
        onValue={(value) => onChange({ [WIFI_FIELDS.password]: value })}
      />
      <div className={styles.field}>
        <label htmlFor="wifi-encryption" className={styles.label}>
          Tipo de segurança
        </label>
        <select
          id="wifi-encryption"
          className={styles.input}
          value={asString(fields, WIFI_FIELDS.encryption) || 'WPA'}
          onChange={(event) => onChange({ [WIFI_FIELDS.encryption]: event.target.value })}
        >
          {WIFI_ENCRYPTIONS.map((encryption) => (
            <option key={encryption} value={encryption}>
              {encryption === 'nopass' ? 'Sem senha (aberta)' : encryption}
            </option>
          ))}
        </select>
      </div>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={asBoolean(fields, WIFI_FIELDS.hidden)}
          onChange={(event) => onChange({ [WIFI_FIELDS.hidden]: event.target.checked })}
        />
        Rede oculta
      </label>
    </div>
  )
}

export function FacebookFields({ fields, onChange }: FieldsProps) {
  return (
    <div className={styles.fields}>
      <TextField
        id="facebook-url"
        label="Página ou perfil do Facebook"
        placeholder="Ex.: https://facebook.com/minhapagina"
        value={asString(fields, FACEBOOK_FIELD)}
        onValue={(value) => onChange({ [FACEBOOK_FIELD]: value })}
      />
    </div>
  )
}