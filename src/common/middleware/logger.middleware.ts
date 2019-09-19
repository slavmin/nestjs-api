import { Injectable, NestMiddleware } from '@nestjs/common';
import { debug } from 'console';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    debug('Request...');
    next();
  }
}
