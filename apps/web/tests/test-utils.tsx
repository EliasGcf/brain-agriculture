import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { apiStore } from '../src/store/store';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v8';
import { Toaster } from '../src/components/ui/sonner';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <NuqsAdapter>
      <Provider store={apiStore}>{ui}</Provider>
      <Toaster />
    </NuqsAdapter>,
  );
}
