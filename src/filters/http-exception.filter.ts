import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { timestamp } from "rxjs";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{

    catch(
        exception: HttpException,
        host: ArgumentsHost
    ) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus()
        const exceptionResponse = exception.getResponse();
        response.status(status).json({
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exceptionResponse
        });
    }
}