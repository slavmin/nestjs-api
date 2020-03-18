import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { verify as Jwtverify } from 'jsonwebtoken';
// import 'dotenv/config';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  // if route is protected, there is a user set in auth.middleware
  if (!!request.user) {
    return request.user;
  }
  // in case a route is not protected, we still want to get the optional auth user from jwt
  const token = request.headers.authorization ? (request.headers.authorization as string).split(' ') : null;
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
