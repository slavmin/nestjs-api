import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtPayload } from './../../modules/auth/dto/auth.dto';
import * as jwt from 'jsonwebtoken';
import { bindNodeCallback, Observable, of } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import { User } from './../../modules/users/interfaces/user.interface';
import { Socket } from 'socket.io';
// import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
// import { JwtStrategy } from './../../modules/auth/strategies/jwt.strategy';

@Injectable()
export class WsJwtGuard implements CanActivate {
  // constructor() {}

  private logger: Logger = new Logger('WsJwtGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Observable<boolean>
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();

    if (data.credentials) {
      const authToken = data.credentials.access_token;
      const refreshToken = data.credentials.refresh_token;
      const user: User = data.user;
      this.logger.log('From Guard: message');
      // Bonus if you need to access your user after the guard
      context.switchToWs().getData().user = user;
    } else {
      const clientHeaders = client.handshake.headers;
      this.logger.log('From Guard: connection');
    }
    // const jwtPayload: JwtPayload = <JwtPayload> jwt.verify(authToken, process.env.JWT_REFRESH_SECRET, { ignoreExpiration: false });
    // this.logger.log('From Guard: ' + JSON.stringify(data));
    return true;

    // const data = context.switchToWs().getData();
    // const authHeader = data.headers.authorization;
    // const authToken = authHeader.substring(7, authHeader.length);
    // const verify: (...args: any[]) => Observable<JwtPayload> = bindNodeCallback(jwt.verify) as any;

    // return verify(authToken, process.env.JWT_SECRET_KEY, null)
    //   .pipe(
    //     flatMap(jwtPayload => this.jwtStrategy.validate(jwtPayload, null)),
    //     catchError(e => {
    //       console.error(e);
    //       return of(null);
    //     }),
    //     map((user: User | null) => {
    //       const isVerified = Boolean(user);

    //       if (!isVerified) {
    //         throw new UnauthorizedException();
    //       }

    //       return isVerified;
    //     }),
    //   );
  }
}
