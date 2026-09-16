import { api } from "./api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    createProducer: build.mutation<
      CreateProducerApiResponse,
      CreateProducerApiArg
    >({
      query: (queryArg) => ({
        url: `/producers`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    listProducers: build.query<ListProducersApiResponse, ListProducersApiArg>({
      query: (queryArg) => ({
        url: `/producers`,
        params: {
          name: queryArg.name,
          document: queryArg.document,
          page: queryArg.page,
          perPage: queryArg.perPage,
        },
      }),
    }),
    getProducerById: build.query<
      GetProducerByIdApiResponse,
      GetProducerByIdApiArg
    >({
      query: (queryArg) => ({ url: `/producers/${queryArg.id}` }),
    }),
    updateProducer: build.mutation<
      UpdateProducerApiResponse,
      UpdateProducerApiArg
    >({
      query: (queryArg) => ({
        url: `/producers/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.body,
      }),
    }),
    deleteProducer: build.mutation<
      DeleteProducerApiResponse,
      DeleteProducerApiArg
    >({
      query: (queryArg) => ({
        url: `/producers/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    listFarmsByProducer: build.query<
      ListFarmsByProducerApiResponse,
      ListFarmsByProducerApiArg
    >({
      query: (queryArg) => ({ url: `/producers/${queryArg.producerId}/farms` }),
    }),
    listHarvestsByFarm: build.query<
      ListHarvestsByFarmApiResponse,
      ListHarvestsByFarmApiArg
    >({
      query: (queryArg) => ({ url: `/farms/${queryArg.farmId}/harvests` }),
    }),
    listPlantedCropsByHarvest: build.query<
      ListPlantedCropsByHarvestApiResponse,
      ListPlantedCropsByHarvestApiArg
    >({
      query: (queryArg) => ({
        url: `/harvests/${queryArg.harvestId}/planted-crops`,
      }),
    }),
    createFarm: build.mutation<CreateFarmApiResponse, CreateFarmApiArg>({
      query: (queryArg) => ({
        url: `/farms`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getFarmById: build.query<GetFarmByIdApiResponse, GetFarmByIdApiArg>({
      query: (queryArg) => ({ url: `/farms/${queryArg.id}` }),
    }),
    updateFarm: build.mutation<UpdateFarmApiResponse, UpdateFarmApiArg>({
      query: (queryArg) => ({
        url: `/farms/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.body,
      }),
    }),
    deleteFarm: build.mutation<DeleteFarmApiResponse, DeleteFarmApiArg>({
      query: (queryArg) => ({ url: `/farms/${queryArg.id}`, method: "DELETE" }),
    }),
    createHarvest: build.mutation<
      CreateHarvestApiResponse,
      CreateHarvestApiArg
    >({
      query: (queryArg) => ({
        url: `/harvests`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getHarvestById: build.query<
      GetHarvestByIdApiResponse,
      GetHarvestByIdApiArg
    >({
      query: (queryArg) => ({ url: `/harvests/${queryArg.id}` }),
    }),
    updateHarvest: build.mutation<
      UpdateHarvestApiResponse,
      UpdateHarvestApiArg
    >({
      query: (queryArg) => ({
        url: `/harvests/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.body,
      }),
    }),
    deleteHarvest: build.mutation<
      DeleteHarvestApiResponse,
      DeleteHarvestApiArg
    >({
      query: (queryArg) => ({
        url: `/harvests/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    createPlantedCrop: build.mutation<
      CreatePlantedCropApiResponse,
      CreatePlantedCropApiArg
    >({
      query: (queryArg) => ({
        url: `/planted-crops`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getPlantedCropById: build.query<
      GetPlantedCropByIdApiResponse,
      GetPlantedCropByIdApiArg
    >({
      query: (queryArg) => ({ url: `/planted-crops/${queryArg.id}` }),
    }),
    updatePlantedCrop: build.mutation<
      UpdatePlantedCropApiResponse,
      UpdatePlantedCropApiArg
    >({
      query: (queryArg) => ({
        url: `/planted-crops/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.body,
      }),
    }),
    deletePlantedCrop: build.mutation<
      DeletePlantedCropApiResponse,
      DeletePlantedCropApiArg
    >({
      query: (queryArg) => ({
        url: `/planted-crops/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    getDashboardMetrics: build.query<
      GetDashboardMetricsApiResponse,
      GetDashboardMetricsApiArg
    >({
      query: () => ({ url: `/metrics` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type CreateProducerApiResponse = /** status 201  */ ProducerResponse;
export type CreateProducerApiArg = {
  body: {
    name: string;
    document: string;
  };
};
export type ListProducersApiResponse =
  /** status 200  */ PaginatedProducerResponse;
export type ListProducersApiArg = {
  name?: string;
  document?: string;
  page?: number;
  perPage?: number;
};
export type GetProducerByIdApiResponse = /** status 200  */ ProducerResponse;
export type GetProducerByIdApiArg = {
  id: string;
};
export type UpdateProducerApiResponse = /** status 200  */ ProducerResponse;
export type UpdateProducerApiArg = {
  id: string;
  body: {
    name?: string;
    document?: string;
  };
};
export type DeleteProducerApiResponse = unknown;
export type DeleteProducerApiArg = {
  id: string;
};
export type ListFarmsByProducerApiResponse = /** status 200  */ FarmResponse[];
export type ListFarmsByProducerApiArg = {
  producerId: string;
};
export type ListHarvestsByFarmApiResponse =
  /** status 200  */ HarvestResponse[];
export type ListHarvestsByFarmApiArg = {
  farmId: string;
};
export type ListPlantedCropsByHarvestApiResponse =
  /** status 200  */ PlantedCropResponse[];
export type ListPlantedCropsByHarvestApiArg = {
  harvestId: string;
};
export type CreateFarmApiResponse = /** status 201  */ FarmResponse;
export type CreateFarmApiArg = {
  body: {
    name: string;
    producerId: string;
    city: string;
    state: string;
    totalArea: number;
    arableArea: number;
    vegetationArea: number;
  };
};
export type GetFarmByIdApiResponse = /** status 200  */ FarmResponse;
export type GetFarmByIdApiArg = {
  id: string;
};
export type UpdateFarmApiResponse = /** status 200  */ FarmResponse;
export type UpdateFarmApiArg = {
  id: string;
  body: {
    name?: string;
    producerId?: string;
    city?: string;
    state?: string;
    totalArea?: number;
    arableArea?: number;
    vegetationArea?: number;
  };
};
export type DeleteFarmApiResponse = unknown;
export type DeleteFarmApiArg = {
  id: string;
};
export type CreateHarvestApiResponse = /** status 201  */ HarvestResponse;
export type CreateHarvestApiArg = {
  body: {
    name: string;
    farmId: string;
  };
};
export type GetHarvestByIdApiResponse = /** status 200  */ HarvestResponse;
export type GetHarvestByIdApiArg = {
  id: string;
};
export type UpdateHarvestApiResponse = /** status 200  */ HarvestResponse;
export type UpdateHarvestApiArg = {
  id: string;
  body: {
    name: string;
  };
};
export type DeleteHarvestApiResponse = unknown;
export type DeleteHarvestApiArg = {
  id: string;
};
export type CreatePlantedCropApiResponse =
  /** status 201  */ PlantedCropResponse;
export type CreatePlantedCropApiArg = {
  body: {
    name: string;
    harvestId: string;
  };
};
export type GetPlantedCropByIdApiResponse =
  /** status 200  */ PlantedCropResponse;
export type GetPlantedCropByIdApiArg = {
  id: string;
};
export type UpdatePlantedCropApiResponse =
  /** status 200  */ PlantedCropResponse;
export type UpdatePlantedCropApiArg = {
  id: string;
  body: {
    name: string;
  };
};
export type DeletePlantedCropApiResponse = unknown;
export type DeletePlantedCropApiArg = {
  id: string;
};
export type GetDashboardMetricsApiResponse =
  /** status 200  */ DashboardMetricsResponse;
export type GetDashboardMetricsApiArg = void;
export type ProducerResponse = {
  id: string;
  name: string;
  document: {
    type: "cpf" | "cnpj";
    value: string;
    formatted: string;
  };
  createdAt: string;
};
export type PaginatedProducerResponse = {
  items: {
    id: string;
    name: string;
    document: {
      type: "cpf" | "cnpj";
      value: string;
      formatted: string;
    };
    createdAt: string;
    farmsCount: number;
  }[];
  total: number;
};
export type FarmResponse = {
  id: string;
  name: string;
  producerId: string;
  city: string;
  state: string;
  totalArea: number;
  arableArea: number;
  vegetationArea: number;
  createdAt: string;
};
export type HarvestResponse = {
  id: string;
  name: string;
  farmId: string;
  createdAt: string;
};
export type PlantedCropResponse = {
  id: string;
  name: string;
  harvestId: string;
  createdAt: string;
};
export type DashboardMetricsResponse = {
  farmCount: number;
  producerCount: number;
  totalHectares: number;
  hectaresByState: {
    state: string;
    hectares: number;
  }[];
  farmsByCrop: {
    crop: string;
    farms: number;
  }[];
  landUse: {
    arableArea: number;
    vegetationArea: number;
    otherUses: number;
  };
};
export const {
  useCreateProducerMutation,
  useListProducersQuery,
  useGetProducerByIdQuery,
  useUpdateProducerMutation,
  useDeleteProducerMutation,
  useListFarmsByProducerQuery,
  useListHarvestsByFarmQuery,
  useListPlantedCropsByHarvestQuery,
  useCreateFarmMutation,
  useGetFarmByIdQuery,
  useUpdateFarmMutation,
  useDeleteFarmMutation,
  useCreateHarvestMutation,
  useGetHarvestByIdQuery,
  useUpdateHarvestMutation,
  useDeleteHarvestMutation,
  useCreatePlantedCropMutation,
  useGetPlantedCropByIdQuery,
  useUpdatePlantedCropMutation,
  useDeletePlantedCropMutation,
  useGetDashboardMetricsQuery,
} = injectedRtkApi;
