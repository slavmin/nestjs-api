import { createParamDecorator, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { verify as Jwtverify } from 'jsonwebtoken';
import redis from 'redis';
import 'dotenv/config';

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

      if (decoded.jti === redisData.refreshTokenId) {
        return redisData;
      } else {
        // Logger for debugging only
        // Logger.log(decoded.jti + ' ' + redisData.refreshTokenId);
        throw new HttpException('NOT_VALID_REFRESH_TOKEN', HttpStatus.BAD_REQUEST);
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpException('TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('TOKEN_NOT_VALID', HttpStatus.BAD_REQUEST);
    }
  }
  throw new HttpException('TOKEN_MISSING', HttpStatus.BAD_REQUEST);
});
