import { createParamDecorator, HttpException, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { verify } from "jsonwebtoken";
import { UserModel } from "../models/user.model";

export const JWT_SECRET = process.env.JWT_SECRET ?? ''

@Injectable()
export class AuthMiddleware implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request    = context.switchToHttp().getRequest<Request>()
    const authHeader = request.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException({ status: 401, message: 'Unauthorized' }, 401)
    }

    const token = authHeader.split(' ')[1]

    if (!token || !JWT_SECRET) {
      throw new HttpException({ status: 401, message: 'Missing token or JWT secret' }, 401)
    }

    try {
      const decoded = verify(token, JWT_SECRET)

      if (typeof decoded === 'string') {
        throw new Error("Invalid token payload");
      }

      const user    = await UserModel.where('email', decoded.email).fetch({ require: true, withRelated : ['role'] })

      request.user  = {
        id      : user.get('id'),
        name    : user.get('name'),
        email   : user.get('email'),
        role    : user.related('role')?.get('name'),
        avatar  : user.get('avatar'),
      }

      return true
    } catch {
      throw new HttpException({ status: 403, message: 'Invalid or expired token' }, 403)
    }
  }
}

@Injectable()
export class AdminOnly implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<Request>().user

    if (!user || user.role != 'admin') {
      throw new HttpException({ status: 403, message: 'Forbidden: Admins only' }, 403)
    }

    return true
  }
}

@Injectable()
export class TutornAdmin implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<Request>().user

    if (!user || user.role != 'admin' && user.role != 'tutor') {
      throw new HttpException({ status: 403, message: 'Forbidden: Admins and Tutor only' }, 403)
    }

    return true
  }
}

export const AuthUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<Request>().user
})
