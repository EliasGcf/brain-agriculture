import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  createComboboxItems,
} from '@components/ui/combobox';
import { ProducerAsyncSelect } from '@components/producer-async-select';
import { StateSelect } from '@components/state-select';
import { Button } from '@components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import { Spinner } from '@components/ui/spinner';
import { SaveIcon } from 'lucide-react';

import type { CreateFarmApiArg, FarmResponse } from '@store/api/api.generated';
import { useGetIbgeMunicipiosV1ByUfQuery } from '@store/brasil-api/api.generated';

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
  farm?: FarmResponse;
  producerId?: string;
  onSubmit: (body: CreateFarmApiArg['body']) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
};

function limitDecimalPlaces(value: string, decimalPlaces = 2) {
  const [integerPart, decimalPart] = value.replace(',', '.').split('.');

  if (decimalPart === undefined) return value;

  return `${integerPart}.${decimalPart.slice(0, decimalPlaces)}`;
}

export function FarmForm({
  farm,
  producerId,
  onSubmit,
  onCancel,
  isLoading = false,
}: FarmFormProps) {
  const [cityOpen, setCityOpen] = useState(false);
  const form = useForm<FarmFormValues>({
    resolver: zodResolver(farmFormSchema),
    defaultValues: {
      name: farm?.name ?? '',
      producerId: farm?.producerId ?? producerId ?? '',
      city: farm?.city ?? '',
      state: farm?.state ?? '',
      totalArea: farm ? String(farm.totalArea) : '',
      arableArea: farm ? String(farm.arableArea) : '',
      vegetationArea: farm ? String(farm.vegetationArea) : '',
    },
  });
  const selectedState = form.watch('state');
  const municipalitiesQuery = useGetIbgeMunicipiosV1ByUfQuery(
    selectedState.length === 2 ? { uf: selectedState } : skipToken,
  );
  const municipalities = municipalitiesQuery.currentData ?? [];

  const municipalityItems = useMemo(
    () =>
      createComboboxItems(municipalities, {
        getValue: (municipality) => municipality.nome,
        getLabel: (municipality) => municipality.nome,
      }),
    [municipalities],
  );

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
                <ProducerAsyncSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}
        <Controller
          name="state"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="farm-state">Estado</FieldLabel>
              <StateSelect
                value={field.value}
                onValueChange={(value) => {
                  if (value !== field.value) form.setValue('city', '');
                  field.onChange(value);
                }}
                disabled={isLoading}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="city"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="farm-city">Cidade</FieldLabel>
              <Combobox
                value={field.value}
                items={municipalityItems}
                open={cityOpen}
                onOpenChange={setCityOpen}
                onValueChange={(value) => field.onChange(value ?? '')}
              >
                <ComboboxInput
                  id="farm-city"
                  aria-label="Cidade"
                  placeholder={
                    selectedState ? 'Selecione uma cidade' : 'Selecione o estado primeiro'
                  }
                  aria-invalid={fieldState.invalid}
                  disabled={isLoading || selectedState.length !== 2}
                  onChange={(event) => field.onChange(event.target.value)}
                />
                <ComboboxContent>
                  <ComboboxList>
                    {(municipality) => (
                      <ComboboxItem
                        key={municipality.codigo_ibge}
                        value={municipality.nome}
                      >
                        {municipality.nome}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                  <ComboboxEmpty>Nenhuma cidade encontrada.</ComboboxEmpty>
                </ComboboxContent>
              </Combobox>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="col-span-full grid gap-4 sm:grid-cols-3">
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
                    type="number"
                    inputMode="decimal"
                    min={name === 'totalArea' ? '0.01' : '0'}
                    step="0.01"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                    onChange={(event) =>
                      field.onChange(limitDecimalPlaces(event.target.value))
                    }
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          ))}
        </div>
      </FieldGroup>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
