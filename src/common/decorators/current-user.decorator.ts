import { createParamDecorator, HttpException, HttpStatus } from '@nestjs/common';
import { verify as Jwtverify } from 'jsonwebtoken';
// import 'dotenv/config';

export const CurrentUser = createParamDecorator(async (data, req) => {
  // if route is protected, there is a user set in auth.middleware
  if (!!req.user) {
    return req.user;
  }
  // in case a route is not protected, we still want to get the optional auth user from jwt
  const token = req.headers.authorization ? (req.headers.authorization as string).split(' ') : null;
  if (token && token[1]) {
    try {
      const decoded: any = Jwtverify(token[1], process.env.JWT_SECRET, { ignoreExpiration: false });
      return decoded.sub;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpException('TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('TOKEN_ERROR', HttpStatus.UNAUTHORIZED);
    }
  }
});
