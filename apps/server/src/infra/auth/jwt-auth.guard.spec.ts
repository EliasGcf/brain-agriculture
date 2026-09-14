import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

const JWT_SECRET = 'test-secret';
const USER_ID = '123e4567-e89b-12d3-a456-426614174000';

class PublicController {
  @Public()
  publicRoute() {}
}

class ProtectedController {
  protectedRoute() {}
}

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({ secret: JWT_SECRET });
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(jwtService, reflector);

  function makeContext(
    authorization: string | undefined,
    controller: typeof PublicController | typeof ProtectedController = ProtectedController,
    handler: Function = ProtectedController.prototype.protectedRoute,
  ) {
    const request: { headers: { authorization?: string }; user?: Record<string, unknown> } = {
      headers: { authorization },
    };
    const context = new ExecutionContextHost([request], controller, handler);

    return { context, request };
  }

  it('should be able to authenticate with a valid JWT', async () => {
    const token = await jwtService.signAsync({ sub: USER_ID });
    const { context, request } = makeContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toMatchObject({ sub: USER_ID });
  });

  it.each([
    ['missing authorization', undefined],
    ['malformed authorization', 'Basic token'],
    ['empty bearer token', 'Bearer '],
    ['a bearer authorization with extra segments', 'Bearer token extra'],
  ])('should not be able to authenticate with %s', async (_name, authorization) => {
    const { context } = makeContext(authorization);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should not be able to authenticate with a token signed by another secret', async () => {
    const token = await new JwtService({ secret: 'another-secret' }).signAsync({
      sub: USER_ID,
    });
    const { context } = makeContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should not be able to authenticate with an expired token', async () => {
    const token = await jwtService.signAsync(
      { sub: USER_ID },
      { expiresIn: -1 },
    );
    const { context } = makeContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should not be able to authenticate with a token whose subject is not a UUID', async () => {
    const token = await jwtService.signAsync({ sub: 'user-id' });
    const { context } = makeContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should be able to bypass authentication for a public route', async () => {
    const { context } = makeContext(
      undefined,
      PublicController,
      PublicController.prototype.publicRoute,
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
