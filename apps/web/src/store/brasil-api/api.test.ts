import { describe, expect, it } from 'vitest'

import { brasilApi } from './api.generated'
import { apiStore } from '../store'

describe('Brasil API integration', () => {
  it('should be able to list municipalities by state', async () => {
    await expect(
      apiStore.dispatch(
        brasilApi.endpoints.getIbgeMunicipiosV1ByUf.initiate({ uf: 'BA' }),
      ).unwrap(),
    ).resolves.toEqual([
      expect.objectContaining({ nome: 'Salvador' }),
    ])
  })
})
