import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Handle Mongo duplicate key error
    if (exception?.code === 11000) {
      const duplicatedField = Object.keys(exception.keyValue || {})[0];
      const message =
        duplicatedField && duplicatedField.toLowerCase() === 'email'
          ? 'Email already exists'
          : 'Resource already exists';

      response.status(HttpStatus.CONFLICT).json({
        success: false,
        code: HttpStatus.CONFLICT,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res: any = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : Array.isArray(res?.message)
          ? res.message[0]
          : res?.message || exception.message || 'An error occurred';

      response.status(status).json({
        success: false,
        code: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Fallback for unknown errors
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}


