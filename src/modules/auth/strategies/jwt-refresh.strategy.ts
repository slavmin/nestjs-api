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

    return data ? done(null, data.user) : null;
  }
}
