import { toast } from 'sonner';
import { useNavigate } from 'react-router';

import { useCreateFarmMutation, type CreateFarmApiArg } from '@store/api/api.generated';
import { FarmForm } from '@components/farm-form';

export function CreateFarmPage() {
  const navigate = useNavigate();
  const [createFarm, { isLoading }] = useCreateFarmMutation();

  async function handleSubmit(body: CreateFarmApiArg['body']) {
    try {
      await createFarm({ body }).unwrap();
      navigate('/farms');
    } catch {
      toast.error('Não foi possível cadastrar a fazenda.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Cadastros</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Nova fazenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cadastre uma fazenda rural.</p>
      </div>
      <FarmForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={() => navigate('/farms')}
      />
    </div>
  );
}
