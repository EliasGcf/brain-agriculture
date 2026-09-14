import { Module } from '@nestjs/common';
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
    const { CryptographyModule } = await import(
      './cryptography.module.js'
    );

    @Module({ imports: [CryptographyModule] })
    class ConsumerModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [ConsumerModule],
    })
      .overrideProvider(EnvService)
      .useValue({ get: (key: string) => (key === 'JWT_SECRET' ? 'test-secret' : undefined) })
      .compile();

    const hashGenerator = moduleRef.get(HashGenerator);
    const hashComparer = moduleRef.get(HashComparer);
    const encrypter = moduleRef.get(Encrypter);
    const jwtService = moduleRef.get(JwtService);
    const token = await encrypter.encrypt({ sub: 'user-id' });
    const payload = await jwtService.verifyAsync<{
      sub: string;
      exp: number;
      iat: number;
    }>(token);

    expect(hashGenerator).toBeDefined();
    expect(hashComparer).toBeDefined();
    expect(payload.sub).toBe('user-id');
    expect(payload.exp - payload.iat).toBe(86400);

    await moduleRef.close();
  });
});
