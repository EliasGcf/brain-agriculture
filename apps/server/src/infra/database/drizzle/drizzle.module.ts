import { DRIZZLE, DRIZZLE_POOL } from '@infra/database/drizzle/drizzle.constants';
import { DrizzleFarmsRepository } from '@infra/database/drizzle/repositories/drizzle-farms.repository';
import { DrizzleHarvestsRepository } from '@infra/database/drizzle/repositories/drizzle-harvests.repository';
import { DrizzlePlantedCropsRepository } from '@infra/database/drizzle/repositories/drizzle-planted-crops.repository';
import { DrizzleProducersRepository } from '@infra/database/drizzle/repositories/drizzle-producers.repository';
import { DrizzleUsersRepository } from '@infra/database/drizzle/repositories/drizzle-users.repository';
import { schema } from '@infra/database/drizzle/schema';
import { EnvModule } from '@infra/env/env.module';
import { EnvService } from '@infra/env/env.service';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { UsersRepository } from '@modules/auth/domain/repositories/users.repository';
import { Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: DRIZZLE_POOL,
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        return new Pool({ connectionString: env.get('DATABASE_URL') });
      },
    },
    {
      provide: DRIZZLE,
      inject: [DRIZZLE_POOL],
      useFactory: (pool: Pool) => {
        return drizzle(pool, { schema, casing: 'snake_case' });
      },
    },
    {
      provide: ProducersRepository,
      useClass: DrizzleProducersRepository,
    },
    {
      provide: FarmsRepository,
      useClass: DrizzleFarmsRepository,
    },
    {
      provide: HarvestsRepository,
      useClass: DrizzleHarvestsRepository,
    },
    {
      provide: PlantedCropsRepository,
      useClass: DrizzlePlantedCropsRepository,
    },
    {
      provide: UsersRepository,
      useClass: DrizzleUsersRepository,
    },
  ],
  exports: [
    DRIZZLE,
    ProducersRepository,
    FarmsRepository,
    HarvestsRepository,
    PlantedCropsRepository,
    UsersRepository,
  ],
})
export class DrizzleModule implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationBootstrap() {
    const pool = this.moduleRef.get<Pool>(DRIZZLE_POOL, { strict: false });
    if (pool) await pool.connect().then((client) => client.release());
  }

  async onApplicationShutdown() {
    const pool = this.moduleRef.get<Pool>(DRIZZLE_POOL, { strict: false });
    if (pool) await pool.end();
  }
}
