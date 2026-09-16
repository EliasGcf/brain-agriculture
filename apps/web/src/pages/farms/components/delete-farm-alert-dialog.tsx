import type { ReactElement } from 'react'
import { toast } from 'sonner'

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
} from '@components/ui/alert-dialog'
import { Spinner } from '@components/ui/spinner'
import { useDeleteFarmMutation } from '@store/api/api.generated'

type DeleteFarmAlertDialogProps = {
  farmId: string
  farmName: string
  onSuccess: () => void | Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: ReactElement
}

function statusOf(error: unknown) {
  return (error as { status?: number })?.status
}

function deletionMessage(error: unknown) {
  if (statusOf(error) === 404) return 'A fazenda não foi encontrada.'
  return 'Não foi possível excluir a fazenda.'
}

export function DeleteFarmAlertDialog({ farmId, farmName, onSuccess, open, onOpenChange, trigger }: DeleteFarmAlertDialogProps) {
  const [deleteFarm, deleteState] = useDeleteFarmMutation()

  async function handleDelete() {
    try {
      await deleteFarm({ id: farmId }).unwrap()
      onOpenChange(false)
      await onSuccess()
    } catch (error) {
      toast.error(deletionMessage(error))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fazenda?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {farmName}? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteState.isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleteState.isLoading} onClick={handleDelete}>
            {deleteState.isLoading ? <Spinner aria-label="Excluindo fazenda" /> : 'Excluir fazenda'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
