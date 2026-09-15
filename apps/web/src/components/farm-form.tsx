import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@components/ui/combobox';
import { Button } from '@components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import { Spinner } from '@components/ui/spinner';
import { SaveIcon } from 'lucide-react';

import type { CreateFarmApiArg, ProducerResponse } from '@store/api.generated';

const farmFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome da fazenda.'),
    producerId: z.string().trim().min(1, 'Selecione um produtor.'),
    city: z.string().trim().min(1, 'Informe a cidade.'),
    state: z.string().trim().length(2, 'Informe o estado com duas letras.'),
    totalArea: z
      .string()
      .trim()
      .refine((value) => {
        const area = Number(value.replace(',', '.'));
        return Number.isFinite(area) && area > 0;
      }, 'A área total deve ser maior que zero.'),
    arableArea: z
      .string()
      .trim()
      .refine((value) => {
        const area = Number(value.replace(',', '.') || 0);
        return Number.isFinite(area) && area >= 0;
      }, 'A área agricultável não pode ser negativa.'),
    vegetationArea: z
      .string()
      .trim()
      .refine((value) => {
        const area = Number(value.replace(',', '.') || 0);
        return Number.isFinite(area) && area >= 0;
      }, 'A área de vegetação não pode ser negativa.'),
  })
  .superRefine((values, context) => {
    const totalArea = Number(values.totalArea.replace(',', '.'));
    const arableArea = Number(values.arableArea.replace(',', '.') || 0);
    const vegetationArea = Number(values.vegetationArea.replace(',', '.') || 0);

    if (arableArea + vegetationArea > totalArea) {
      context.addIssue({
        code: 'custom',
        path: ['vegetationArea'],
        message:
          'As áreas agricultável e de vegetação não podem ultrapassar a área total.',
      });
    }
  });

type FarmFormValues = z.infer<typeof farmFormSchema>;

type FarmFormProps = {
  producerId?: string;
  producers?: ProducerResponse[];
  onSubmit: (body: CreateFarmApiArg['body']) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
};

const defaultValues: FarmFormValues = {
  name: '',
  producerId: '',
  city: '',
  state: '',
  totalArea: '',
  arableArea: '',
  vegetationArea: '',
};

export function FarmForm({
  producerId,
  producers = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: FarmFormProps) {
  const form = useForm<FarmFormValues>({
    resolver: zodResolver(farmFormSchema),
    defaultValues: { ...defaultValues, producerId: producerId ?? '' },
  });

  async function handleSubmit(values: FarmFormValues) {
    const body: CreateFarmApiArg['body'] = {
      name: values.name.trim(),
      producerId: values.producerId,
      city: values.city.trim(),
      state: values.state.trim().toUpperCase(),
      totalArea: Number(values.totalArea.replace(',', '.')),
      arableArea: Number(values.arableArea.replace(',', '.') || 0),
      vegetationArea: Number(values.vegetationArea.replace(',', '.') || 0),
    };

    await onSubmit(body);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nome da fazenda</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                disabled={isLoading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {!producerId && (
          <Controller
            name="producerId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="farm-producer">Produtor</FieldLabel>
                <Combobox
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? '')}
                >
                  <ComboboxInput
                    id="farm-producer"
                    placeholder="Selecione um produtor"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {producers.map((producer) => (
                        <ComboboxItem key={producer.id} value={producer.id}>
                          {producer.name}
                        </ComboboxItem>
                      ))}
                      <ComboboxEmpty>Nenhum produtor encontrado.</ComboboxEmpty>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}
        <Controller
          name="city"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Cidade</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                disabled={isLoading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="state"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
              <Input
                {...field}
                id={field.name}
                maxLength={2}
                aria-invalid={fieldState.invalid}
                disabled={isLoading}
                onChange={(event) => field.onChange(event.target.value.toUpperCase())}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {(['totalArea', 'arableArea', 'vegetationArea'] as const).map((name) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {name === 'totalArea'
                    ? 'Área total (ha)'
                    : name === 'arableArea'
                      ? 'Área agricultável (ha)'
                      : 'Área de vegetação (ha)'}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  inputMode="decimal"
                  aria-invalid={fieldState.invalid}
                  disabled={isLoading}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}
      </FieldGroup>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner />
              Salvando fazenda...
            </>
          ) : (
            <>
              <SaveIcon />
              Salvar fazenda
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
