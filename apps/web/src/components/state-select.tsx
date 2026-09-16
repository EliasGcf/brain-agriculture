import { useMemo, useState } from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  createComboboxItems,
} from '@components/ui/combobox'
import { BRASIL_STATES } from '@utils/brasil-states'

type StateSelectProps = {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  id?: string
}

export function StateSelect({
  value,
  onValueChange,
  disabled = false,
  invalid = false,
  id = 'farm-state',
}: StateSelectProps) {
  const [open, setOpen] = useState(false)
  const items = useMemo(
    () =>
      createComboboxItems(BRASIL_STATES, {
        getLabel: (state) => state.name,
        getValue: (state) => state.uf,
      }),
    [],
  )

  return (
    <Combobox
      value={value}
      items={items}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
    >
      <ComboboxInput
        id={id}
        aria-label="Estado"
        placeholder="Escolha um estado"
        aria-invalid={invalid}
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxList>
          {(state) => (
            <ComboboxItem key={state.uf} value={state.uf}>
              {state.name}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>Nenhum estado encontrado.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
