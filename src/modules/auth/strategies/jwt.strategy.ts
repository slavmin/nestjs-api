import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, CACHE_MANAGER, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './../../users/users.service';
import { ConfigService } from '../../config';
import { JwtPayload } from '../dto/auth.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger: Logger = new Logger('JwtStrategy');

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload, done: VerifiedCallback) {
    const data = await this.getTokenFromStore(payload).catch(err => {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    });

    if (payload.jti === data.accessTokenId) {
      return data ? done(null, data.user) : null;
    }

    return null;
  }

  async getTokenFromStore(payload: JwtPayload): Promise<any> {
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
