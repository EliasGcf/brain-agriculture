import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AsyncSelect } from '@components/ui/async-select';
import { api, type ProducerResponse } from '@store/api/api.generated';
import type { AppDispatch } from '@store/store';

type ProducerAsyncSelectProps = {
  value?: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

export function ProducerAsyncSelect({
  value = '',
  onValueChange,
  disabled = false,
  label = 'Produtor',
}: ProducerAsyncSelectProps) {
  const dispatch = useDispatch<AppDispatch>();

  const fetcherOptions = useCallback(
    async (query = ''): Promise<ProducerResponse[]> => {
      const search = query.trim();

      const response = await dispatch(
        api.endpoints.listProducers.initiate(
          { search, page: 1, perPage: 10 },
          { subscribe: false },
        ),
      ).unwrap();

      return response.items;
    },
    [dispatch],
  );

  const fetcherOption = useCallback(
    async (id: string): Promise<ProducerResponse | null> =>
      dispatch(
        api.endpoints.getProducerById.initiate({ id }, { subscribe: false }),
      ).unwrap(),
    [dispatch],
  );

  return (
    <AsyncSelect
      fetcherOptions={fetcherOptions}
      fetcherOption={fetcherOption}
      value={value ?? ''}
      onChange={onValueChange}
      label={label}
      placeholder="Selecione o produtor"
      noResultsMessage="Nenhum produtor encontrado."
      width="100%"
      triggerClassName="w-full"
      renderOption={(producer) => (
        <span className="flex flex-col text-left">
          <span>{producer.name}</span>
          <span className="text-xs text-muted-foreground">
            {producer.document.formatted}
          </span>
        </span>
      )}
      getOptionValue={(producer) => producer.id}
      getDisplayValue={(producer) => producer.name}
      disabled={disabled}
    />
  );
}
