import { brasilApi as api } from "./api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getIbgeMunicipiosV1ByUf: build.query<
      GetIbgeMunicipiosV1ByUfApiResponse,
      GetIbgeMunicipiosV1ByUfApiArg
    >({
      query: (queryArg) => ({
        url: `/ibge/municipios/v1/${queryArg.uf}`,
        params: {
          providers: queryArg.providers,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as brasilApi };
export type GetIbgeMunicipiosV1ByUfApiResponse =
  /** status 200 Successo */ Municipality[];
export type GetIbgeMunicipiosV1ByUfApiArg = {
  /** Sigla da unidade federativa, por exemplo SP, RJ, SC, etc.
   */
  uf: string;
  /** Lista de provedores separados por vírgula.<br><strong>Provedores disponíveis:</strong> <ul><li>dados-abertos-br</li><li>gov</li><li>wikipedia</li></ul> */
  providers?: string;
};
export type Municipality = {
  nome: string;
  codigo_ibge: string;
};
export const { useGetIbgeMunicipiosV1ByUfQuery } = injectedRtkApi;
