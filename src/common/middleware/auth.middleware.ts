import { Injectable, NestMiddleware, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from './../../modules/config';
import { verify as Jwtverify } from 'jsonwebtoken';
import { debug } from 'console';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService, @Inject(CACHE_MANAGER) private readonly cacheManager) {}

  private logger: Logger = new Logger('AuthMiddleware');

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization ? (req.headers.authorization as string).split(' ') : null;

    if (token && token[1]) {
      try {
        const decoded: any = Jwtverify(token[1], this.configService.get('JWT_SECRET'), { ignoreExpiration: true });
        const cachedData = await this.getTokenFromStore(decoded);
        req.user = cachedData.user;
      } catch (err) {
        this.logger.log('AuthMiddleware: ' + err);
      }
    }
    // debug('Request...' + JSON.stringify(req.user));
    next();
  }

  async getTokenFromStore(payload: any): Promise<any> {
    const cacheClient = this.cacheManager.store.getClient();
    return await new Promise((resolve, reject) => {
      cacheClient.get(payload.sub, (error: any, response: string) => {
        if (error) {
          reject(error);
        }
        resolve(JSON.parse(response));
      });
    });
  }
}
