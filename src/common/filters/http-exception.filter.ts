import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import moment = require('moment');

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response.message || error.response.error || error.message;
    const time = error.response.time;

    const response = {
      statusCode: status,
      error: error.response.name || error.response.error || error.name,
      message,
      time,
      errors: error.response.errors || null,
      timestamp: new Date().toISOString(),
      path: req ? req.url : null,
    };

    Logger.log(`${req.method} ${req.url} ${moment().format('DD/MM/YYYY HH:mm:ss')}`, message);
    res.status(status).json({ ...response, time });
  }
}
