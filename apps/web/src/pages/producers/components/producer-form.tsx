import { useState, type FormEvent } from 'react'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'

import { isValidDocument, maskDocument, normalizeDocument } from '../producer-validation'
import type { Producer } from '../producer-fixtures'

type ProducerFormProps = {
  producer?: Producer
  existingDocuments: string[]
  onSubmit: (data: { name: string; document: string }) => void
  onCancel?: () => void
}

export function ProducerForm({ producer, existingDocuments, onSubmit, onCancel }: ProducerFormProps) {
  const [name, setName] = useState(producer?.name ?? '')
  const [document, setDocument] = useState(producer ? maskDocument(producer.document) : '')
  const [errors, setErrors] = useState<{ name?: string; document?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Informe o nome do produtor.'
    const normalizedDocument = normalizeDocument(document)
    if (!isValidDocument(normalizedDocument)) {
      nextErrors.document = 'Informe um CPF ou CNPJ válido.'
    } else if (existingDocuments.includes(normalizedDocument) && normalizedDocument !== producer?.document) {
      nextErrors.document = 'Este CPF ou CNPJ já está cadastrado.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    window.setTimeout(() => {
      onSubmit({ name: name.trim(), document: normalizedDocument })
      setIsSubmitting(false)
    }, 0)
  }

  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="producer-name" className="text-sm font-medium">Nome completo ou razão social</label>
            <Input
              id="producer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="producer-document" className="text-sm font-medium">CPF ou CNPJ</label>
            <Input
              id="producer-document"
              inputMode="numeric"
              value={document}
              onChange={(event) => setDocument(maskDocument(event.target.value))}
              aria-invalid={Boolean(errors.document)}
            />
            {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
          </div>
        </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar produtor'}</Button>
          </div>
      </form>
    </div>
  )
}
