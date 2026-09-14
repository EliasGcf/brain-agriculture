import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { z } from 'zod';

import { PUBLIC_ROUTE } from './public.decorator';

type AuthenticatedRequest = Request & {
  user?: Record<string, unknown>;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [, token] = authorization?.match(/^Bearer ([^\s]+)$/) ?? [];

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token);
      if (typeof payload.sub !== 'string' || !isUuid(payload.sub)) {
        throw new UnauthorizedException();
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

function isUuid(value: string) {
  return z.uuid().safeParse(value).success;
}
