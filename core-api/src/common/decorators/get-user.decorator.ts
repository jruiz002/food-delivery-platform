import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Definimos la estructura estricta que esperamos de nuestro payload del JWT
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const user = request.user;

    if (!user) return null;

    return data ? user[data] : user;
  },
);
