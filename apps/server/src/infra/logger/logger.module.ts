import { Module } from '@nestjs/common';
import { LoggerModule as NestPinoModule, nativeLoggerOptions } from 'nestjs-pino';

import type { PrettyOptions } from 'pino-pretty'

import { EnvModule } from '@infra/env/env.module';
import { EnvService } from '@infra/env/env.service';

@Module({
  imports: [
    NestPinoModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        return {
          pinoHttp: env.isDev
            ? {
                transport: {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true } as PrettyOptions,
                },
              }
            : nativeLoggerOptions,
        };
      },
    }),
  ],
  exports: [NestPinoModule],
})
export class LoggerModule {}
