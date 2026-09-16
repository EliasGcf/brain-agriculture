import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { DeleteFarmUseCase } from '@modules/farms/application/use-cases/delete-farm.use-case';
import z from 'zod';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Farms')
@Controller('farms/:id')
export class DeleteFarmController {
  constructor(private readonly useCase: DeleteFarmUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiNoContentResponse()
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    await this.useCase.execute({ id });
  }
}
