export type DashboardStateData = {
  state: string
  hectares: number
}

export type DashboardCropData = {
  crop: string
  farms: number
}

export type DashboardData = {
  farmCount: number
  producerCount: number
  totalHectares: number
  hectaresByState: DashboardStateData[]
  farmsByCrop: DashboardCropData[]
  landUse: {
    arableArea: number
    vegetationArea: number
    otherUses: number
  }
}

export const dashboardData: DashboardData = {
  farmCount: 24,
  producerCount: 18,
  totalHectares: 1248.5,
  hectaresByState: [
    { state: 'São Paulo', hectares: 775.5 },
    { state: 'Minas Gerais', hectares: 298.5 },
    { state: 'Goiás', hectares: 174.5 },
  ],
  farmsByCrop: [
    { crop: 'Soja', farms: 12 },
    { crop: 'Milho', farms: 8 },
    { crop: 'Café', farms: 5 },
    { crop: 'Algodão', farms: 3 },
  ],
  landUse: {
    arableArea: 886.5,
    vegetationArea: 125.5,
    otherUses: 236.5,
  },
}
