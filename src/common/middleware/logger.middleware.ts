import { Injectable, NestMiddleware, Logger, NestModule } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly Logger = new Logger(
        LoggerMiddleware.name
    );

    use(
        request: Request,
        response: Response,
        next: NextFunction,
    ) {
        this.Logger.log(
            `${request.method} ${request.originalUrl}`,
        );

        next();
    }
}