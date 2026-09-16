import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  useCreatePlantedCropMutation,
  useDeletePlantedCropMutation,
  useUpdatePlantedCropMutation,
} from '@store/api/api.generated';
import { Button } from '@components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { Input } from '@components/ui/input';
import { Spinner } from '@components/ui/spinner';
import { Field, FieldError } from '@components/ui/field';
import { TableCell, TableRow } from '@components/ui/table';
import type { PlantedCropFormValue } from '@components/farm-form.types';

type PlantedCropFormProps = {
  harvestId: string;
  crop: PlantedCropFormValue;
  onSaved: (crop: { id: string; name: string }) => void;
  onRemove: () => void;
};

const plantedCropFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da cultura.'),
});

type PlantedCropFormValues = z.infer<typeof plantedCropFormSchema>;

export function PlantedCropForm({
  harvestId,
  crop,
  onSaved,
  onRemove,
}: PlantedCropFormProps) {
  const formId = `planted-crop-form-${crop.key ?? crop.id}`;
  const form = useForm<PlantedCropFormValues>({
    resolver: zodResolver(plantedCropFormSchema),
    defaultValues: { name: crop.name },
  });
  const [createCrop, createState] = useCreatePlantedCropMutation();
  const [updateCrop, updateState] = useUpdatePlantedCropMutation();
  const [deleteCrop, deleteState] = useDeletePlantedCropMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const name = form.watch('name');
  const isSaving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(values: PlantedCropFormValues) {
    try {
      const saved = crop.id
        ? await updateCrop({ id: crop.id, body: { name: values.name } }).unwrap()
        : await createCrop({ body: { name: values.name, harvestId } }).unwrap();
      onSaved(saved);
      form.reset({ name: saved.name });
      toast.success('Cultura salva.');
    } catch {
      toast.error('Não foi possível salvar a cultura.');
    }
  }

  async function handleDelete() {
    if (!crop.id) {
      onRemove();
      setDeleteOpen(false);
      return;
    }

    try {
      await deleteCrop({ id: crop.id }).unwrap();
      onRemove();
      setDeleteOpen(false);
      toast.success('Cultura excluída.');
    } catch {
      toast.error('Não foi possível excluir a cultura.');
    }
  }

  return (
    <TableRow className="border-b-0">
      <TableCell className="w-full">
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  className="h-8"
                  placeholder="Ex: Soja, Milho, etc."
                  aria-label="Nome da cultura"
                  aria-invalid={fieldState.invalid}
                  disabled={isSaving}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </TableCell>
      <TableCell className="w-12">
        <div className="flex items-center justify-center gap-2">
          <span className="flex size-8 items-center justify-center">
            {form.formState.isDirty && (
              <Button
                type="submit"
                form={formId}
                variant="ghost"
                size="icon-sm"
                className="mx-auto flex size-5 text-green-600 hover:text-green-700"
                aria-label={`Salvar cultura ${name || 'sem nome'}`}
                disabled={isSaving}
              >
                {isSaving ? <Spinner /> : <Save />}
              </Button>
            )}
          </span>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mx-auto flex size-5"
                  aria-label={`Excluir cultura ${name || 'sem nome'}`}
                  disabled={deleteState.isLoading}
                />
              }
            >
              <Trash2 />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cultura?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta cultura será removida da safra.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
