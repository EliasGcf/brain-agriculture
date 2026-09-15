import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from './schema';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }

  get isDev() {
    return this.get('NODE_ENV') === 'development';
  }

  get isTest() {
    return this.get('NODE_ENV') === 'test';
  }

  get isProd() {
    return this.get('NODE_ENV') === 'production';
  }
}
