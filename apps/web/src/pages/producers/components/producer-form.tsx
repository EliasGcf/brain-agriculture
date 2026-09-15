import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';

import { formatDocument, isValidDocument } from '@utils/document';
import type { CreateProducerApiArg, ProducerResponse } from '@store/api.generated';
import { Spinner } from '@components/ui/spinner';
import { SaveIcon } from 'lucide-react';

type ProducerFormValues = CreateProducerApiArg['body'];

const producerFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produtor.'),
  document: z.string().trim().refine(isValidDocument, 'Informe um CPF ou CNPJ válido.'),
});

type ProducerFormProps = {
  producer?: ProducerResponse;
  onSubmit: (data: { name: string; document: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
};

export function ProducerForm({
  producer,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProducerFormProps) {
  const form = useForm<ProducerFormValues>({
    resolver: zodResolver(producerFormSchema),
    defaultValues: {
      name: producer?.name ?? '',
      document: producer?.document.formatted ?? '',
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Nome completo ou razão social
                </FieldLabel>
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
            name="document"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>CPF ou CNPJ</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  inputMode="numeric"
                  aria-invalid={fieldState.invalid}
                  disabled={isLoading}
                  onChange={(event) => field.onChange(formatDocument(event.target.value))}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner />
                Salvando...
              </>
            ) : (
              <>
                <SaveIcon />
                Salvar produtor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
