import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useCreateProducerMutation } from '@store/api.generated';

import { ProducerForm } from './components/producer-form';

function mutationMessage(error: unknown) {
  const status = (error as { status?: number })?.status;
  if (status === 409) return 'Este CPF ou CNPJ já está cadastrado.';
  return 'Não foi possível cadastrar o produtor.';
}

export function CreateProducerPage() {
  const navigate = useNavigate();
  const [createProducer, { isLoading }] = useCreateProducerMutation();

  async function handleSubmit(body: { name: string; document: string }) {
    try {
      await createProducer({ body }).unwrap();
      navigate('/producers');
    } catch (caughtError) {
      toast.error(mutationMessage(caughtError));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Cadastros</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Novo produtor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Cadastre um produtor rural.</p>
      </div>
      <ProducerForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={() => navigate('/producers')}
      />
    </div>
  );
}
