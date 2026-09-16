import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '@infra/auth/auth.module';
import { CreateProducerController } from '@infra/http/controllers/create-producer.controller';
import { CreateProducerUseCase } from '@modules/producers/application/use-cases/create-producer.use-case';
import { APP_FILTER } from '@nestjs/core';
import { GlobalErrorHandling } from '@infra/http/global-error-handling';
import { CreateFarmController } from './controllers/create-farm.controller';
import { GetFarmByIdController } from './controllers/get-farm-by-id.controller';
import { UpdateFarmController } from './controllers/update-farm.controller';
import { DeleteFarmController } from './controllers/delete-farm.controller';
import { CreateHarvestController } from './controllers/create-harvest.controller';
import { GetHarvestByIdController } from './controllers/get-harvest-by-id.controller';
import { UpdateHarvestController } from './controllers/update-harvest.controller';
import { DeleteHarvestController } from './controllers/delete-harvest.controller';
import { CreatePlantedCropController } from './controllers/create-planted-crop.controller';
import { GetPlantedCropByIdController } from './controllers/get-planted-crop-by-id.controller';
import { UpdatePlantedCropController } from './controllers/update-planted-crop.controller';
import { DeletePlantedCropController } from './controllers/delete-planted-crop.controller';
import { CreateFarmUseCase } from '@modules/farms/application/use-cases/create-farm.use-case';
import { GetFarmByIdUseCase } from '@modules/farms/application/use-cases/get-farm-by-id.use-case';
import { UpdateFarmUseCase } from '@modules/farms/application/use-cases/update-farm.use-case';
import { DeleteFarmUseCase } from '@modules/farms/application/use-cases/delete-farm.use-case';
import { CreateHarvestUseCase } from '@modules/farms/application/use-cases/create-harvest.use-case';
import { GetHarvestByIdUseCase } from '@modules/farms/application/use-cases/get-harvest-by-id.use-case';
import { UpdateHarvestUseCase } from '@modules/farms/application/use-cases/update-harvest.use-case';
import { DeleteHarvestUseCase } from '@modules/farms/application/use-cases/delete-harvest.use-case';
import { CreatePlantedCropUseCase } from '@modules/farms/application/use-cases/create-planted-crop.use-case';
import { GetPlantedCropByIdUseCase } from '@modules/farms/application/use-cases/get-planted-crop-by-id.use-case';
import { UpdatePlantedCropUseCase } from '@modules/farms/application/use-cases/update-planted-crop.use-case';
import { DeletePlantedCropUseCase } from '@modules/farms/application/use-cases/delete-planted-crop.use-case';
import { ListProducersController } from './controllers/list-producers.controller';
import { GetProducerByIdController } from './controllers/get-producer-by-id.controller';
import { UpdateProducerController } from './controllers/update-producer.controller';
import { GetProducerByIdUseCase } from '@modules/producers/application/use-cases/get-producer-by-id.use-case';
import { ListProducersUseCase } from '@modules/producers/application/use-cases/list-producers.use-case';
import { UpdateProducerUseCase } from '@modules/producers/application/use-cases/update-producer.use-case';
import { DeleteProducerController } from './controllers/delete-producer.controller';
import { ListFarmsByProducerController } from './controllers/list-farms-by-producer.controller';
import { ListHarvestsByFarmController } from './controllers/list-harvests-by-farm.controller';
import { ListPlantedCropsByHarvestController } from './controllers/list-planted-crops-by-harvest.controller';
import { DeleteProducerUseCase } from '@modules/producers/application/use-cases/delete-producer.use-case';
import { ListFarmsByProducerUseCase } from '@modules/farms/application/use-cases/list-farms-by-producer.use-case';
import { ListHarvestsByFarmUseCase } from '@modules/farms/application/use-cases/list-harvests-by-farm.use-case';
import { ListPlantedCropsByHarvestUseCase } from '@modules/farms/application/use-cases/list-planted-crops-by-harvest.use-case';
import { ListFarmsController } from './controllers/list-farms.controller';
import { ListFarmsUseCase } from '@modules/farms/application/use-cases/list-farms.use-case';
import { GetDashboardMetricsController } from './controllers/get-dashboard-metrics.controller';
import { GetDashboardMetricsUseCase } from '@modules/metrics/application/use-cases/get-dashboard-metrics.use-case';
import { HealthController } from './controllers/health.controller';
import { AuthenticateUserController } from "@infra/http/controllers/authenticate-user.controller";
import { AuthenticateUserUseCase } from "@modules/auth/application/use-cases/authenticate-user.use-case";
import { CryptographyModule } from "@infra/cryptography/cryptography.module";
import { MeController } from '@infra/http/controllers/me.controller';
import { LogoutUserController } from '@infra/http/controllers/logout-user.controller';
import { EnvModule } from "@infra/env/env.module";

@Module({
  imports: [EnvModule, DatabaseModule, AuthModule, CryptographyModule],
  controllers: [
    AuthenticateUserController,
    MeController,
    LogoutUserController,
    CreateProducerController,
    ListProducersController,
    GetProducerByIdController,
    UpdateProducerController,
    DeleteProducerController,
    ListFarmsByProducerController,
    ListFarmsController,
    ListHarvestsByFarmController,
    ListPlantedCropsByHarvestController,
    CreateFarmController,
    GetFarmByIdController,
    UpdateFarmController,
    DeleteFarmController,
    CreateHarvestController,
    GetHarvestByIdController,
    UpdateHarvestController,
    DeleteHarvestController,
    CreatePlantedCropController,
    GetPlantedCropByIdController,
    UpdatePlantedCropController,
    DeletePlantedCropController,
    GetDashboardMetricsController,
    HealthController,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalErrorHandling },
    AuthenticateUserUseCase,
    CreateProducerUseCase,
    CreateFarmUseCase,
    GetFarmByIdUseCase,
    UpdateFarmUseCase,
    DeleteFarmUseCase,
    CreateHarvestUseCase,
    GetHarvestByIdUseCase,
    UpdateHarvestUseCase,
    DeleteHarvestUseCase,
    CreatePlantedCropUseCase,
    GetPlantedCropByIdUseCase,
    UpdatePlantedCropUseCase,
    DeletePlantedCropUseCase,
    GetProducerByIdUseCase,
    ListProducersUseCase,
    UpdateProducerUseCase,
    DeleteProducerUseCase,
    ListFarmsByProducerUseCase,
    ListFarmsUseCase,
    ListHarvestsByFarmUseCase,
    ListPlantedCropsByHarvestUseCase,
    GetDashboardMetricsUseCase,
  ],
})
export class HttpModule {}
