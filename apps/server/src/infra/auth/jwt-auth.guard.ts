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

import { IS_PUBLIC_KEY } from "@infra/auth/public.decorator";
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const PayloadSchema = z.object({
  sub: z.uuid()
});

type AuthenticatedRequest = Request & {
  cookies?: { access_token?: string };
  user?: z.infer<typeof PayloadSchema>
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[AUTH_COOKIE];

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const validPayload = PayloadSchema.parse(payload);
      request.user = validPayload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
