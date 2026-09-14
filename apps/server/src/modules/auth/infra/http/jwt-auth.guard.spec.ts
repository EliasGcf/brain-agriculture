import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
  let guard: JwtAuthGuard;

  const makeContext = (authorization?: string) => {
    const request = { headers: { authorization } };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return { context, request };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    guard = new JwtAuthGuard(jwtService, reflector);
  });

  it('should be able to accept a valid bearer token with a UUID subject', async () => {
    const payload = { sub: '123e4567-e89b-12d3-a456-426614174000' };
    const { context, request } = makeContext('Bearer valid-token');
    jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request).toHaveProperty('user', payload);
  });

  it.each([
    ['missing authorization', undefined],
    ['malformed authorization', 'Basic token'],
    ['empty bearer token', 'Bearer '],
    ['a bearer authorization with extra segments', 'Bearer token extra'],
  ])('should not be able to authenticate with %s', async (_name, authorization) => {
    const { context } = makeContext(authorization);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it.each([
    ['an invalid signature', new Error('invalid signature')],
    ['an expired token', new Error('jwt expired')],
  ])('should not be able to authenticate with %s', async (_name, error) => {
    const { context } = makeContext('Bearer invalid-token');
    jwtService.verifyAsync = jest.fn().mockRejectedValue(error);

    await expect(guard.canActivate(context)).rejects.toEqual(new UnauthorizedException());
  });

  it('should not be able to authenticate with a token whose subject is not a UUID', async () => {
    const { context } = makeContext('Bearer valid-token');
    jwtService.verifyAsync = jest.fn().mockResolvedValue({ sub: 'user-id' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should be able to bypass authentication for a public route', async () => {
    const { context } = makeContext();
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });
});
