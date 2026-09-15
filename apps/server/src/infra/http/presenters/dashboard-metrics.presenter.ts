import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { DashboardMetricsDto } from '@modules/metrics/application/dto/dashboard-metrics.dto';

const schema = z.object({
  farmCount: z.number(),
  producerCount: z.number(),
  totalHectares: z.number(),
  hectaresByState: z.array(z.object({ state: z.string(), hectares: z.number() })),
  farmsByCrop: z.array(z.object({ crop: z.string(), farms: z.number() })),
  landUse: z.object({
    arableArea: z.number(),
    vegetationArea: z.number(),
    otherUses: z.number(),
  }),
});

export class DashboardMetricsPresenter {
  static Response = createZodDto(schema);

  static toHTTP(metrics: DashboardMetricsDto) {
    return schema.parse(metrics);
  }
}
