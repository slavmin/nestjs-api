import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../../config';
import { JwtPayload } from '../dto/auth.dto';
import { JwtAuthService } from './../jwt/jwt-auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService, private readonly jwtAuthService: JwtAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: JwtPayload, done: VerifiedCallback) {
    const data = await this.jwtAuthService.getTokenFromStore(payload).catch(() => {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    });

    if (payload.jti !== data.refreshTokenId) {
      throw new HttpException('NOT_VALID_REFRESH_TOKEN', HttpStatus.BAD_REQUEST);
    }

    const expIn = parseInt(this.configService.get('JWT_REFRESH_EXPIRATION'), 10);
    const atExpire = parseInt(this.configService.get('JWT_EXPIRATION'), 10);
    const atExpireLag = parseInt(this.configService.get('JWT_EXPIRATION_LAG'), 10);
    const passIn = parseInt(data.ttl, 10);

    if (atExpire - (expIn - passIn) > atExpireLag) {
      throw new HttpException('TOKEN_NOT_EXPIRED', HttpStatus.BAD_REQUEST);
    }

    return data ? done(null, data.user) : null;
  }
}
