import { toast } from 'sonner';
import { Link, useNavigate, useParams } from 'react-router';

import {
  useGetFarmByIdQuery,
  useUpdateFarmMutation,
  type CreateFarmApiArg,
} from '@store/api/api.generated';
import { FarmForm } from '@components/farm-form';
import { LoadingCard } from '@components/loading-card';
import { RetryCard } from '@components/retry-card';

function statusOf(error: unknown) {
  return (error as { status?: number })?.status;
}

function updateMessage(error: unknown) {
  if (statusOf(error) === 404) return 'A fazenda não foi encontrada.';
  return 'Não foi possível atualizar a fazenda.';
}

export function EditFarmPage() {
  const { farmId } = useParams() as { farmId: string };
  const navigate = useNavigate();
  const farmQuery = useGetFarmByIdQuery(
    { id: farmId },
    { refetchOnMountOrArgChange: true },
  );
  const [updateFarm, updateState] = useUpdateFarmMutation();

  async function handleUpdate(body: CreateFarmApiArg['body']) {
    try {
      await updateFarm({ id: farmId, body }).unwrap();
      await farmQuery.refetch();
    } catch (caughtError) {
      toast.error(updateMessage(caughtError));
    }
  }

  if (farmQuery.isLoading) {
    return <LoadingCard label="Carregando fazenda" />;
  }
  if (statusOf(farmQuery.error) === 404) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Fazenda não encontrada</h1>
        <p className="text-sm text-muted-foreground">A fazenda informada não existe.</p>
        <Link className="text-sm font-medium text-primary underline" to="/farms">
          Voltar para fazendas
        </Link>
      </div>
    );
  }
  if (farmQuery.error || !farmQuery.data) {
    return (
      <RetryCard
        title="Não foi possível carregar a fazenda."
        description="Tente novamente para recarregar os dados da fazenda."
        onRetry={() => farmQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Fazenda</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {farmQuery.data.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edite os dados da fazenda rural.
        </p>
      </div>
      <FarmForm
        farm={farmQuery.data}
        onSubmit={handleUpdate}
        isLoading={updateState.isLoading}
        onCancel={() => navigate('/farms')}
      />
    </div>
  );
}
