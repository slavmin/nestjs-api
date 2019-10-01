import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import moment from 'moment';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const name = error.response ? error.response.name || error.response.error || error.name : null;
    const message = error.response
      ? error.response.message || error.response.error || error.message
      : 'SOMETHING_WENT_WRONG';
    const time = error.response ? error.response.time : null;

    const response = {
      status,
      error: name,
      message,
      time,
      errors: error.response ? error.response.errors : null,
      timestamp: new Date().toISOString(),
      path: req ? req.url : null,
    };

    Logger.log(`${req.method} ${req.url} ${moment().format('DD/MM/YYYY HH:mm:ss')}`, message);
    res.status(status).json({ ...response, time });
  }
}
