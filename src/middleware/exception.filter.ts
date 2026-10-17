import { Catch, HttpException } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter as NestExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const body   = exception.getResponse() as any

      return response.status(status).json({
        status  : body?.status ?? status,
        message : body?.message ?? exception.message,
        data    : body?.data ?? null
      })
    }

    console.error('❌ Unhandled error:', exception)

    return response.status(500).json({
      status  : 500,
      message : exception?.message ?? 'Internal server error',
      data    : null
    })
  }
}
