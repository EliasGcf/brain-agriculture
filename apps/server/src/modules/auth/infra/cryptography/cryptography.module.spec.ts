import { Inject, Injectable, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { Encrypter } from '@modules/auth/application/cryptography/encrypter';
import { HashComparer } from '@modules/auth/application/cryptography/hash-comparer';
import { HashGenerator } from '@modules/auth/application/cryptography/hash-generator';
import { EnvService } from '@infra/env/env.service';

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/tests';
process.env.JWT_SECRET = 'test-secret';

describe('CryptographyModule', () => {
  it('should be able to resolve cryptography contracts and sign and verify a token', async () => {
    const { CryptographyModule } = require('./cryptography.module') as typeof import('./cryptography.module');

    @Injectable()
    class Consumer {
      constructor(
        @Inject(HashGenerator) readonly hashGenerator: HashGenerator,
        @Inject(HashComparer) readonly hashComparer: HashComparer,
        @Inject(Encrypter) readonly encrypter: Encrypter,
        @Inject(JwtService) readonly jwtService: JwtService,
      ) {}
    }

    @Module({ imports: [CryptographyModule], providers: [Consumer], exports: [Consumer] })
    class ConsumerModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [ConsumerModule],
    })
      .overrideProvider(EnvService)
      .useValue({ get: (key: string) => (key === 'JWT_SECRET' ? 'test-secret' : undefined) })
      .compile();

    const consumer = moduleRef.select(ConsumerModule).get(Consumer, { strict: true });
    const token = await consumer.encrypter.encrypt({ sub: 'user-id' });
    const payload = await consumer.jwtService.verifyAsync<{
      sub: string;
      exp: number;
      iat: number;
    }>(token);

    expect(consumer.hashGenerator).toBeDefined();
    expect(consumer.hashComparer).toBeDefined();
    expect(consumer.encrypter).toBeDefined();
    expect(consumer.jwtService).toBeDefined();
    expect(payload.sub).toBe('user-id');
    expect(payload.exp - payload.iat).toBe(86400);

    await moduleRef.close();
  });
});
