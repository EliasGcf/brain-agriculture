import { useState, type FormEvent } from 'react'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'

import type { FarmSummary } from '../producer-fixtures'

type InlineFarmFormProps = {
  onSubmit: (farm: Omit<FarmSummary, 'id'>) => void
  onCancel: () => void
}

export function InlineFarmForm({ onSubmit, onCancel }: InlineFarmFormProps) {
  const [values, setValues] = useState({ name: '', city: '', state: '', totalArea: '', arableArea: '', vegetationArea: '' })
  const [error, setError] = useState('')

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const totalArea = Number(values.totalArea.replace(',', '.'))
    const arableArea = Number(values.arableArea.replace(',', '.') || 0)
    const vegetationArea = Number(values.vegetationArea.replace(',', '.') || 0)
    if (!values.name.trim() || !values.city.trim() || !values.state.trim()) return setError('Preencha nome, cidade e estado.')
    if (!Number.isFinite(totalArea) || totalArea <= 0) return setError('A área total deve ser maior que zero.')
    if (arableArea < 0 || vegetationArea < 0 || arableArea + vegetationArea > totalArea) {
      return setError('As áreas agricultável e de vegetação não podem ultrapassar a área total.')
    }
    onSubmit({ name: values.name.trim(), city: values.city.trim(), state: values.state.trim().toUpperCase(), totalArea, arableArea, vegetationArea })
  }

  return (
    <form className="space-y-4 rounded-lg border bg-muted/20 p-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">Nome da fazenda<Input value={values.name} onChange={(event) => update('name', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium">Cidade<Input value={values.city} onChange={(event) => update('city', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium">Estado<Input maxLength={2} value={values.state} onChange={(event) => update('state', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium">Área total (ha)<Input inputMode="decimal" value={values.totalArea} onChange={(event) => update('totalArea', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium">Área agricultável (ha)<Input inputMode="decimal" value={values.arableArea} onChange={(event) => update('arableArea', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium">Área de vegetação (ha)<Input inputMode="decimal" value={values.vegetationArea} onChange={(event) => update('vegetationArea', event.target.value)} /></label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">Salvar fazenda</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
