import { Module } from '@nestjs/common';

import { EnvService } from '@infra/env/env.service';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from '@infra/env/schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validationSchema: EnvSchema,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
