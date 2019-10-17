import { Injectable, HttpStatus, HttpException, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/interfaces/user.interface';
import { ConfigService } from '../../config';
import { JwtPayload } from '../dto/auth.dto';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import uuid from 'uuid';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager,
  ) {}

  private logger: Logger = new Logger('JwtAuthService');

  /**
   * Validates the token
   *
   * @param {string} token - The JWT token to validate
   * @param {boolean} isWs - True to handle WS exception instead of HTTP exception (default: false)
   * @param {boolean} isRefresh
   */
  async verify(token: string, isRefresh: boolean = false, isWs: boolean = false): Promise<User | null> {
    const jwtSecret = isRefresh ? this.configService.get('JWT_REFRESH_SECRET') : this.configService.get('JWT_SECRET');
    const payload = jwt.verify(token, jwtSecret) as any;
    const data = await this.getTokenFromStore(payload).catch(err => {
      if (isWs) {
        throw new WsException('UNAUTHORIZED');
      } else {
        throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
      }
    });

    if (!isRefresh) {
      if (payload.jti !== data.accessTokenId) {
        throw new HttpException('TOKEN_NOT_VALID', HttpStatus.BAD_REQUEST);
      }
      return data ? data.user : null;
    }

    if (isRefresh) {
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

      return data ? await this.getTokens(data.user) : null;
    }

    return null;
  }

  /**
   * Generates a new JWT token
   *
   * @param {User} user - The user to create the payload for the JWT
   * @returns {Promise} tokens - The access and the refresh token
   */
  async getTokens(user: User, withUser: boolean = true): Promise<any> {
    const freshUser = await this.usersService.getById(user.id);
    if (freshUser && !freshUser.blocked) {
      const { accessToken, refreshToken, expiresIn } = await this.generateToken(freshUser, true);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        user: freshUser,
      };
    }
  }

  async generateToken(user: User, isWs: boolean = false): Promise<any> {
    const accessTokenId = await JwtAuthService.makeTokenId();
    const accessPayload = { sub: user.id, name: user.name, jti: accessTokenId, scope: 'profile' };

    const refreshTokenId = await JwtAuthService.makeTokenId();
    const refreshPayload = { sub: user.id, jti: refreshTokenId };

    const expiresIn = parseInt(this.configService.get('JWT_REFRESH_EXPIRATION'), 10);

    const accessToken = jwt.sign(accessPayload, this.configService.get('JWT_SECRET'), {
      header: { jti: accessTokenId },
      expiresIn: parseInt(this.configService.get('JWT_EXPIRATION'), 10),
    });
    const refreshToken = jwt.sign(refreshPayload, this.configService.get('JWT_REFRESH_SECRET'), {
      header: { jti: refreshTokenId },
      expiresIn: parseInt(this.configService.get('JWT_REFRESH_EXPIRATION'), 10),
    });

    const cacheClient = await this.cacheManager.store.getClient();
    await cacheClient.set(
      user.id,
      JSON.stringify({ accessTokenId, refreshTokenId, user }),
      'EX',
      this.configService.get('JWT_REFRESH_EXPIRATION'),
      (err: any) => {
        if (err) {
          this.logger.log(err);
          if (isWs) {
            throw new WsException('SERVICE_UNAVAILABLE');
          } else {
            throw new HttpException('SERVICE_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE);
          }
        }
      },
    );

    return { accessToken, refreshToken, expiresIn };
  }

  async getTokenFromStore(payload: JwtPayload): Promise<any> {
    const cacheClient = this.cacheManager.store.getClient();
    return await new Promise((resolve, reject) => {
      cacheClient.get(payload.sub, (error: any, response: string) => {
        error ? reject(error) : resolve(JSON.parse(response));
      });
    }).then(data => {
      return new Promise((resolve, reject) => {
        cacheClient.ttl(payload.sub, (error: any, response: number) => {
          error ? reject(error) : resolve(Object.assign({}, data, { ttl: response }));
        });
      });
    });
  }

  static async makeTokenId(): Promise<string> {
    return crypto
      .createHash('sha256')
      .update(uuid.v4())
      .digest('hex');
  }
}
