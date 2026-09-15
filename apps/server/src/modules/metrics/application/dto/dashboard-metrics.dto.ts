export interface DashboardMetricsDto {
  farmCount: number;
  producerCount: number;
  totalHectares: number;
  hectaresByState: { state: string; hectares: number }[];
  farmsByCrop: { crop: string; farms: number }[];
  landUse: {
    arableArea: number;
    vegetationArea: number;
    otherUses: number;
  };
}

export type FarmsDashboardMetricsDto = Omit<DashboardMetricsDto, 'producerCount'>;
