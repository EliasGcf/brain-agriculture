import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import {
  useGetProducerByIdQuery,
  useUpdateProducerMutation,
} from '@store/api/api.generated';
import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import { LoadingCard } from '@components/loading-card';
import { RetryCard } from '@components/retry-card';

import { DeleteProducerAlertDialog } from './components/delete-producer-alert-dialog';
import { ProducerFarmsSection } from './components/producer-farms-section';
import { ProducerForm } from './components/producer-form';

function statusOf(error: unknown) {
  return (error as { status?: number })?.status;
}

function updateMessage(error: unknown) {
  if (statusOf(error) === 409) return 'Este CPF ou CNPJ já está cadastrado.';
  if (statusOf(error) === 404) return 'O produtor não foi encontrado.';
  return 'Não foi possível atualizar o produtor.';
}

export function EditProducerPage() {
  const { producerId } = useParams() as { producerId: string };
  const navigate = useNavigate();
  const getProducersQuery = useGetProducerByIdQuery(
    { id: producerId },
    { refetchOnMountOrArgChange: true },
  );
  const [updateProducer, updateState] = useUpdateProducerMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function handleUpdate(body: { name: string; document: string }) {
    try {
      await updateProducer({ id: producerId, body }).unwrap();
      await getProducersQuery.refetch();
    } catch (caughtError) {
      toast.error(updateMessage(caughtError));
    }
  }

  function handleDeleteSuccess() {
    navigate('/producers');
  }

  if (getProducersQuery.isLoading) {
    return <LoadingCard label="Carregando produtor" />;
  }
  if (statusOf(getProducersQuery.error) === 404) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Produtor não encontrado</h1>
        <p className="text-sm text-muted-foreground">O produtor informado não existe.</p>
        <Link className="text-sm font-medium text-primary underline" to="/producers">
          Voltar para produtores
        </Link>
      </div>
    );
  }
  if (getProducersQuery.error || !getProducersQuery.data)
    return (
      <RetryCard
        title="Não foi possível carregar o produtor."
        description="Tente novamente para recarregar os dados do produtor."
        onRetry={() => getProducersQuery.refetch()}
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Produtor</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {getProducersQuery.data.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            CPF/CNPJ: {getProducersQuery.data.document.formatted}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DeleteProducerAlertDialog
            producerId={getProducersQuery.data.id}
            producerName={getProducersQuery.data.name}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={handleDeleteSuccess}
            trigger={
              <Button variant="destructive">
                <Trash2 />
                Excluir produtor
              </Button>
            }
          />
        </div>
      </div>

      <ProducerForm
        producer={getProducersQuery.data}
        onSubmit={handleUpdate}
        isLoading={updateState.isLoading}
      />
      <Separator />
      <ProducerFarmsSection producerId={getProducersQuery.data.id} />
    </div>
  );
}
