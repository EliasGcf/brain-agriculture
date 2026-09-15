export type FarmSummary = {
  id: string
  name: string
  city: string
  state: string
  totalArea: number
  arableArea: number
  vegetationArea: number
}

export type Producer = {
  id: string
  name: string
  document: string
  createdAt: string
  farms: FarmSummary[]
}

export const producerFixtures: Producer[] = [
  {
    id: 'producer-1',
    name: 'Agropecuária Boa Safra',
    document: '11222333000181',
    createdAt: '2026-01-15',
    farms: [
      {
        id: 'farm-1',
        name: 'Fazenda Horizonte',
        city: 'Luís Eduardo Magalhães',
        state: 'BA',
        totalArea: 1240.5,
        arableArea: 800,
        vegetationArea: 300.5,
      },
    ],
  },
  {
    id: 'producer-2',
    name: 'Carlos Henrique Oliveira',
    document: '12345678909',
    createdAt: '2026-02-02',
    farms: [],
  },
  {
    id: 'producer-3',
    name: 'Cooperativa Vale Verde',
    document: '11444777000161',
    createdAt: '2026-02-20',
    farms: [
      {
        id: 'farm-2',
        name: 'Sítio Primavera',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 320.25,
        arableArea: 210.25,
        vegetationArea: 60,
      },
    ],
  },
  {
    id: 'producer-4',
    name: 'Fernanda Alves Santos',
    document: '45678912000155',
    createdAt: '2026-03-01',
    farms: [],
  },
  {
    id: 'producer-5',
    name: 'Grupo Campo Forte',
    document: '74185296300',
    createdAt: '2026-03-08',
    farms: [],
  },
]
