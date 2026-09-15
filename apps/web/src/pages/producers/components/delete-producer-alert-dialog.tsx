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
import { useDeleteProducerMutation } from '@store/api.generated'
import { Spinner } from '@components/ui/spinner'

type DeleteProducerAlertDialogProps = {
  producerId: string
  producerName: string
  onSuccess: () => void | Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: ReactElement
}

function statusOf(error: unknown) {
  return (error as { status?: number })?.status
}

function deletionMessage(error: unknown) {
  const status = statusOf(error)
  if (status === 403) return 'O produtor possui fazendas.'
  if (status === 404) return 'O produtor não foi encontrado.'
  return 'Não foi possível excluir o produtor.'
}

export function DeleteProducerAlertDialog({ producerId, producerName, onSuccess, open, onOpenChange, trigger }: DeleteProducerAlertDialogProps) {
  const [deleteProducer, deleteState] = useDeleteProducerMutation()

  async function handleDelete() {
    try {
      await deleteProducer({ id: producerId }).unwrap()
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
          <AlertDialogTitle>Excluir produtor?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {producerName}? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteState.isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleteState.isLoading} onClick={handleDelete}>
            {deleteState.isLoading ? <Spinner aria-label="Excluindo produtor" /> : 'Excluir produtor'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
