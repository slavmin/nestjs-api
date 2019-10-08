import { createParamDecorator, HttpException, HttpStatus } from '@nestjs/common';
import { verify as Jwtverify } from 'jsonwebtoken';
import redis from 'redis';
// import 'dotenv/config';

export const RefreshToken = createParamDecorator(async (data, req) => {
  const token = req.headers.authorization ? (req.headers.authorization as string).split(' ') : null;
  if (token && token[1]) {
    try {
      const decoded: any = Jwtverify(token[1], process.env.JWT_SECRET, { ignoreExpiration: false });
      const cacheClient = redis.createClient();
      const redisData: any = await new Promise((resolve, reject) => {
        cacheClient.get(decoded.sub, (error: any, response: string) => {
          if (error) {
            reject(error);
          }
          resolve(JSON.parse(response));
        });
      });

      const dataTtl: any = await new Promise((resolve, reject) => {
        cacheClient.ttl(decoded.sub, (error: any, response: number) => {
          if (error) {
            reject(error);
          }
          resolve(response);
        });
      });

      const expIn = parseInt(process.env.JWT_REFRESH_EXPIRATION, 10);
      const atExpire = parseInt(process.env.JWT_EXPIRATION, 10);
      const atExpireLag = parseInt(process.env.JWT_EXPIRATION_LAG, 10);
      const passIn = parseInt(dataTtl, 10);

      if (atExpire - (expIn - passIn) > atExpireLag) {
        throw new HttpException('TOKEN_NOT_EXPIRED', HttpStatus.BAD_REQUEST);
      }

      if (decoded.jti === redisData.refreshTokenId) {
        return redisData;
      } else {
        throw new HttpException('NOT_VALID_REFRESH_TOKEN', HttpStatus.BAD_REQUEST);
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpException('TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
      }
      if (err.response === 'TOKEN_NOT_EXPIRED') {
        throw new HttpException('TOKEN_NOT_EXPIRED', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('TOKEN_NOT_VALID', HttpStatus.BAD_REQUEST);
    }
  }
  throw new HttpException('TOKEN_MISSING', HttpStatus.BAD_REQUEST);
});
