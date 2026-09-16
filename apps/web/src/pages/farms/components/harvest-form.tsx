import { useState } from 'react';
import { ChevronDown, ChevronRight, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  useCreateHarvestMutation,
  useDeleteHarvestMutation,
  useUpdateHarvestMutation,
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
import {
  TableCell,
  TableRow,
} from '@components/ui/table';
import { PlantedCropsSection } from './planted-crops-section';
import type { HarvestFormValue } from '@components/farm-form.types';

type HarvestFormProps = {
  farmId: string;
  harvest: HarvestFormValue;
  expanded: boolean;
  onToggle: () => void;
  onSaved: (harvest: { id: string; name: string }) => void;
  onRemove: () => void;
};

const harvestFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da safra.'),
});

type HarvestFormValues = z.infer<typeof harvestFormSchema>;

export function HarvestForm({
  farmId,
  harvest,
  expanded,
  onToggle,
  onSaved,
  onRemove,
}: HarvestFormProps) {
  const formId = `harvest-form-${harvest.key ?? harvest.id}`;
  const form = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues: { name: harvest.name },
  });
  const [createHarvest, createState] = useCreateHarvestMutation();
  const [updateHarvest, updateState] = useUpdateHarvestMutation();
  const [deleteHarvest, deleteState] = useDeleteHarvestMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const name = form.watch('name');
  const isSaving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(values: HarvestFormValues) {
    try {
      const saved = harvest.id
        ? await updateHarvest({ id: harvest.id, body: { name: values.name } }).unwrap()
        : await createHarvest({ body: { name: values.name, farmId } }).unwrap();
      onSaved(saved);
      form.reset({ name: saved.name });
      toast.success('Safra salva.');
    } catch {
      toast.error('Não foi possível salvar a safra.');
    }
  }

  async function handleDelete() {
    if (!harvest.id) {
      onRemove();
      setDeleteOpen(false);
      return;
    }

    try {
      await deleteHarvest({ id: harvest.id }).unwrap();
      onRemove();
      setDeleteOpen(false);
      toast.success('Safra excluída.');
    } catch {
      toast.error('Não foi possível excluir a safra.');
    }
  }

  return (
    <>
      <TableRow aria-expanded={expanded}>
        <TableCell className="pl-1 pr-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`${expanded ? 'Recolher' : 'Expandir'} safra ${name || 'sem nome'}`}
            onClick={onToggle}
          >
            {expanded ? <ChevronDown /> : <ChevronRight />}
          </Button>
        </TableCell>
        <TableCell>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    className="h-8"
                    placeholder="Ex: Safra 2022"
                    autoFocus
                    aria-label="Nome da safra"
                    aria-invalid={fieldState.invalid}
                    disabled={isSaving}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </form>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-center gap-2 pr-2">
            <span className="flex size-8 items-center justify-center">
              {form.formState.isDirty && (
                <Button
                  type="submit"
                  form={formId}
                  variant="ghost"
                  size="icon-sm"
                  className="mx-auto flex size-5 text-green-600 hover:text-green-700"
                  aria-label={`Salvar safra ${name || 'sem nome'}`}
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
                    aria-label={`Excluir safra ${name || 'sem nome'}`}
                    disabled={deleteState.isLoading}
                  />
                }
              >
                <Trash2 />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir safra?</AlertDialogTitle>
                  <AlertDialogDescription>
                    As culturas vinculadas a esta safra também serão excluídas.
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
      {expanded && (
        <TableRow>
          <TableCell colSpan={3} className="p-2">
            {harvest.id ? (
              <PlantedCropsSection
                harvestId={harvest.id}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Salve a safra para adicionar culturas.
              </p>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
