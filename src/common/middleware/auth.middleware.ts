import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from './../../modules/auth/jwt/jwt-auth.service';
import { User } from './../../modules/users/interfaces/user.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  private logger: Logger = new Logger('AuthMiddleware');

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.substring(7, authHeader.length) : null;

    if (token) {
      try {
        const user: User = await this.jwtAuthService.verify(token, false, false, { ignoreExpiration: true });
        // this.logger.log('User from jwtAuthService: ' + JSON.stringify(user));
        req.user = user;
      } catch (err) {
        this.logger.error('Error: ' + err + 'Request ' + JSON.stringify(req.url));
      }
    }
    next();
  }
}
