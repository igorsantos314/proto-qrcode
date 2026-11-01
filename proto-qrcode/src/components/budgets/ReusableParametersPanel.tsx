import { useState } from 'react'
import type {
  ReusableParameter,
  ReusableParameterInput,
} from '../../lib/budget/types'
import { formatDecimal } from '../../lib/format'
import styles from './budgets.module.css'

interface ReusableParametersPanelProps {
  parameters: ReusableParameter[]
  storageError: string | null
  onCreate: (input: ReusableParameterInput) => ReusableParameter | null
  onUpdate: (
    id: string,
    patch: Partial<ReusableParameterInput>,
  ) => ReusableParameter | null
  onRemove: (id: string) => boolean
}

interface ParameterRowProps {
  parameter: ReusableParameter
  onUpdate: (
    id: string,
    patch: Partial<ReusableParameterInput>,
  ) => ReusableParameter | null
  onRemove: (id: string) => boolean
}

function ParameterRow({ parameter, onUpdate, onRemove }: ParameterRowProps) {
  const [name, setName] = useState(parameter.name)
  const [unit, setUnit] = useState(parameter.unit)
  const [value, setValue] = useState(String(parameter.value))
  const [error, setError] = useState<string | null>(null)

  const commit = () => {
    const numeric = Number(value.replace(',', '.'))
    if (!name.trim()) {
      setError('Informe o nome do parâmetro.')
      return
    }
    if (!Number.isFinite(numeric) || numeric < 0) {
      setError('Informe um valor válido e não negativo.')
      return
    }
    setError(null)
    onUpdate(parameter.id, {
      name: name.trim(),
      unit: unit.trim(),
      value: numeric,
    })
  }

  return (
    <div className={styles.parameterRow}>
      <div className={styles.field}>
        <label
          className={styles.srOnly}
          htmlFor={`parameter-name-${parameter.id}`}
        >
          Nome do parâmetro {parameter.name}
        </label>
        <input
          id={`parameter-name-${parameter.id}`}
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={commit}
        />
      </div>
      <div className={styles.field}>
        <label
          className={styles.srOnly}
          htmlFor={`parameter-unit-${parameter.id}`}
        >
          Unidade do parâmetro {parameter.name}
        </label>
        <input
          id={`parameter-unit-${parameter.id}`}
          className={styles.input}
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          onBlur={commit}
        />
      </div>
      <div className={styles.field}>
        <label
          className={styles.srOnly}
          htmlFor={`parameter-value-${parameter.id}`}
        >
          Valor do parâmetro {parameter.name}
        </label>
        <input
          id={`parameter-value-${parameter.id}`}
          className={styles.input}
          type="number"
          min={0}
          step="any"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commit}
        />
      </div>
      <button
        type="button"
        className={styles.danger}
        onClick={() => onRemove(parameter.id)}
        aria-label={`Excluir parâmetro ${parameter.name}`}
      >
        Excluir
      </button>
      {error && (
        <p className={styles.notice} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function ReusableParametersPanel({
  parameters,
  storageError,
  onCreate,
  onUpdate,
  onRemove,
}: ReusableParametersPanelProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('R$')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const numeric = Number(value.replace(',', '.'))
    if (!name.trim()) {
      setError('Informe o nome do parâmetro.')
      return
    }
    if (!Number.isFinite(numeric) || numeric < 0) {
      setError('Informe um valor válido e não negativo.')
      return
    }
    setError(null)
    onCreate({ name: name.trim(), unit: unit.trim(), value: numeric })
    setName('')
    setValue('')
  }

  return (
    <section className={styles.card} aria-label="Parâmetros reutilizáveis">
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Parâmetros reutilizáveis</h2>
          <p className={styles.cardHint}>
            Preços e taxas usados para preencher e calcular novos orçamentos.
          </p>
        </div>
        <button
          type="button"
          className={styles.secondary}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? 'Ocultar' : 'Gerenciar'}
        </button>
      </div>

      {storageError && <p className={styles.storageError}>{storageError}</p>}

      {open && (
        <>
          <div className={styles.lineItems}>
            {parameters.length === 0 ? (
              <p className={styles.empty}>Nenhum parâmetro cadastrado.</p>
            ) : (
              parameters.map((parameter) => (
                <ParameterRow
                  key={parameter.id}
                  parameter={parameter}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))
            )}
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Novo parâmetro</h3>
            <div className={styles.parameterRow}>
              <div className={styles.field}>
                <label className={styles.srOnly} htmlFor="new-parameter-name">
                  Nome do novo parâmetro
                </label>
                <input
                  id="new-parameter-name"
                  className={styles.input}
                  placeholder="Nome (ex.: Verniz)"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.srOnly} htmlFor="new-parameter-unit">
                  Unidade do novo parâmetro
                </label>
                <input
                  id="new-parameter-unit"
                  className={styles.input}
                  placeholder="Unidade"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.srOnly} htmlFor="new-parameter-value">
                  Valor do novo parâmetro
                </label>
                <input
                  id="new-parameter-value"
                  className={styles.input}
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Valor"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </div>
              <button
                type="button"
                className={styles.primary}
                onClick={handleAdd}
              >
                Adicionar
              </button>
            </div>
            {error && (
              <p className={styles.notice} role="alert">
                {error}
              </p>
            )}
          </div>

          <p className={styles.cardHint}>
            Valores atuais:{' '}
            {parameters
              .map(
                (parameter) =>
                  `${parameter.name}: ${formatDecimal(parameter.value)} ${parameter.unit}`,
              )
              .join(' • ')}
          </p>
        </>
      )}
    </section>
  )
}
