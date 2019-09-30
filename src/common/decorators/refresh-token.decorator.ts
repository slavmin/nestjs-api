import { createParamDecorator, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { verify as Jwtverify } from 'jsonwebtoken';
import redis from 'redis';
import 'dotenv/config';

export const RefreshToken = createParamDecorator(async (redisData, req) => {
  // if route is protected, there is a user set in auth.middleware
  if (!!req.user) {
    throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
  }
  // in case a route is not protected, we still want to get the optional auth user from jwt
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
        Logger.log(decoded.jti + ' ' + redisData.refreshTokenId);
        throw new HttpException('TOKEN_NOT_VALID_REFRESH_TOKEN', HttpStatus.BAD_REQUEST);
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpException('TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('TOKEN_NOT_VALID', HttpStatus.UNAUTHORIZED);
    }
  }
  throw new HttpException('TOKEN_MISSING', HttpStatus.UNAUTHORIZED);
});
